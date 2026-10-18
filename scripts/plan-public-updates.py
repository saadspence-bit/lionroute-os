"""Plan or quarantine *review-only* updates from an independently owned private app.

This program never writes into the public Git tree, never imports Git history,
never runs network actions, and never marks an update as publication-approved.
Use a separate empty directory with ``prepare`` to hold unreviewed sources.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
BASELINE = ROOT / "docs" / "public-sync-baseline.json"
SCHEMA = "lionroute.public-source-sync.v1"
MAX_SOURCE_BYTES = 256_000
RED_FLAGS = [
    re.compile(rb"-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----"),
    re.compile(rb"(?:gh[pousr]_|github_pat_|sk-proj-|sk-ant-)[A-Za-z0-9_-]{16,}"),
    re.compile(rb"[A-Za-z]:[\\/]Users[\\/]", re.I),
    re.compile(
        rb"(?:Market" rb" AI App|Credit" rb" Repair App|Mission"
        rb" C|LR_UPB_" rb"PHASE_F)", re.I,
    ),
]


class GateError(Exception):
    pass


def normalized(content: bytes) -> bytes:
    # Git stores LF; Windows worktrees can check out CRLF. This is for
    # comparative hashes only, never an excuse to transform staged bytes.
    return content.replace(b"\r\n", b"\n")


def digest(content: bytes) -> str:
    return hashlib.sha256(normalized(content)).hexdigest()


def git(cwd: Path, *args: str) -> bytes:
    try:
        process = subprocess.run(
            ["git", "-C", str(cwd), *args], check=False,
            capture_output=True, timeout=20, shell=False,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        raise GateError("Git inspection unavailable") from error
    if process.returncode:
        raise GateError("Git inspection failed: " + " ".join(args[:2]))
    return process.stdout


def plain_file(p: Path) -> bool:
    try:
        s = p.lstat()
    except OSError:
        return False
    return stat.S_ISREG(s.st_mode) and s.st_nlink == 1


def assert_safe_destination(target: Path, private_root: Path) -> None:
    if not target.is_absolute() or target.exists():
        raise GateError("Review destination must be a new absolute path")
    real = target.resolve(strict=False)
    for protected in (ROOT.resolve(), private_root.resolve()):
        if real == protected or real in protected.parents or protected in real.parents:
            raise GateError("Review destination overlaps a protected worktree")
    for parent in [real, *real.parents]:
        if parent.exists() and (parent.is_symlink() or getattr(parent, "is_junction", lambda: False)()):
            raise GateError("Review destination parent is a reparse point")


def plan(private_app: Path, *, stage_to: Path | None = None) -> dict:
    if not BASELINE.is_file():
        raise GateError("Baseline manifest missing")
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    if baseline.get("schema") != SCHEMA:
        raise GateError("Unsupported baseline schema")
    files = baseline.get("files")
    if not isinstance(files, dict) or not files:
        raise GateError("Empty/invalid baseline")
    if not private_app.is_dir() or private_app.is_symlink():
        raise GateError("Private app directory invalid")
    app = private_app.resolve(strict=True)
    repo = Path(os.fsdecode(git(app, "rev-parse", "--show-toplevel")).strip()).resolve(strict=True)
    prefix = os.fsdecode(git(app, "rev-parse", "--show-prefix")).strip().replace("\\", "/").rstrip("/")
    if not prefix:
        raise GateError("Private app must be a subfolder, not the repository root")
    if repo == ROOT.resolve() or ROOT.resolve() in repo.parents:
        raise GateError("Source must be outside the public candidate repository")
    if not (repo / prefix).samefile(app):
        raise GateError("Private app prefix does not match Git root")
    # Inspect only immutable HEAD: unfinished private changes are not exportable.
    revision = git(app, "rev-parse", "HEAD").decode("ascii").strip()
    if not re.fullmatch(r"[a-f0-9]{40,64}", revision):
        raise GateError("Unexpected private commit identifier")
    dirty = git(app, "status", "--porcelain", "--untracked-files=no", "--", *files.keys())
    if dirty.strip():
        raise GateError("Eligible private source files have uncommitted changes; commit/review privately first")

    statuses: list[dict[str, str]] = []
    staged: dict[str, bytes] = {}
    for rel, pin in sorted(files.items()):
        parts = PurePosixPath(rel)
        if parts.is_absolute() or ".." in parts.parts or str(parts) != rel:
            raise GateError("Invalid path in baseline manifest")
        if not isinstance(pin, str) or not re.fullmatch(r"[a-f0-9]{64}", pin):
            raise GateError("Invalid baseline digest")
        public_file = ROOT.joinpath(*parts.parts)
        if not plain_file(public_file):
            raise GateError("Missing, linked, or reparse-point public baseline file")
        pub_bytes = public_file.read_bytes()
        source_path = f"{prefix}/{rel}"
        # ls-tree pathspec is interpreted relative to -C app; show :path
        # explicitly names the repository-root-relative object.
        mode = git(app, "ls-tree", "HEAD", "--", rel).decode("utf-8", "replace")
        if not mode.startswith(("100644 blob ", "100755 blob ")):
            raise GateError("Private source is not a regular committed blob")
        src_bytes = git(app, "show", f"HEAD:{source_path}")
        if len(src_bytes) > MAX_SOURCE_BYTES:
            raise GateError("Private source exceeds size bound")
        src_sha = digest(src_bytes)
        pub_sha = digest(pub_bytes)
        if src_sha == pub_sha:
            status = "MATCH" if src_sha == pin else "MATCH_NEW_BASELINE_REVIEW_REQUIRED"
        elif pub_sha == pin:
            status = "PRIVATE_CHANGE_REVIEW_REQUIRED"
        else:
            status = "DIVERGED_MANUAL_MERGE_REQUIRED"
        statuses.append({"path": rel, "status": status})
        if status == "PRIVATE_CHANGE_REVIEW_REQUIRED":
            if any(p.search(src_bytes) for p in RED_FLAGS):
                raise GateError("Private candidate contains blocked disclosure marker")
            staged[rel] = src_bytes

    report = {
        "schema": SCHEMA,
        "mode": "PLAN" if stage_to is None else "QUARANTINE_ONLY",
        "sourceRevision": revision,
        "authorityGranted": False,
        "published": False,
        "files": statuses,
        "counts": {status: sum(row["status"] == status for row in statuses)
                   for status in ("MATCH", "MATCH_NEW_BASELINE_REVIEW_REQUIRED",
                                  "PRIVATE_CHANGE_REVIEW_REQUIRED", "DIVERGED_MANUAL_MERGE_REQUIRED")},
    }
    if stage_to is not None:
        if any(row["status"] == "DIVERGED_MANUAL_MERGE_REQUIRED" for row in statuses):
            raise GateError("Diverged public files require a manual three-way review before preparation")
        assert_safe_destination(stage_to, repo)
        stage_to.mkdir(parents=True, exist_ok=False)
        for rel, content in staged.items():
            destination = stage_to.joinpath(*PurePosixPath(rel).parts)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
        (stage_to / "REVIEW_REQUIRED.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        report["reviewPackageCreated"] = True
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Review-only private->public update planner; never publishes")
    parser.add_argument("action", choices=["plan", "prepare"])
    parser.add_argument("--private-app", required=True, type=Path)
    parser.add_argument("--review-dir", type=Path)
    args = parser.parse_args(argv)
    if args.action == "prepare" and args.review_dir is None:
        parser.error("prepare requires --review-dir (new absolute path outside both repos)")
    if args.action == "plan" and args.review_dir is not None:
        parser.error("plan does not take --review-dir")
    try:
        output = plan(args.private_app, stage_to=args.review_dir)
    except (GateError, OSError, ValueError, KeyError, json.JSONDecodeError) as error:
        print(json.dumps({"result": "BLOCKED", "reason": str(error), "authorityGranted": False}), file=sys.stderr)
        return 2
    print(json.dumps(output, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
