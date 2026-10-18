"""Local, offline regression tests for the public-update review gate."""

import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock


SCRIPT = Path(__file__).with_name("plan-public-updates.py")
spec = importlib.util.spec_from_file_location("public_update_planner", SCRIPT)
planner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(planner)


class UpdatePlannerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="lr-public-update-test-")
        self.addCleanup(self.temp.cleanup)
        top = Path(self.temp.name)
        self.repo = top / "private"
        self.app = self.repo / "app"
        self.app.mkdir(parents=True)
        self.public = top / "public"
        (self.public / "src").mkdir(parents=True)
        (self.public / "docs").mkdir()
        self.public_file = self.public / "src" / "example.ts"
        self.public_file.write_bytes(b"export const example = 1;\r\n")
        self.source = self.app / "src" / "example.ts"
        self.source.parent.mkdir()
        self.source.write_bytes(b"export const example = 1;\n")
        self.git("init", "-b", "main")
        self.git("add", "--", "app/src/example.ts")
        self.commit()
        baseline = {
            "schema": planner.SCHEMA,
            "files": {"src/example.ts": planner.digest(self.public_file.read_bytes())},
        }
        self.baseline_file = self.public / "docs" / "public-sync-baseline.json"
        self.baseline_file.write_text(json.dumps(baseline), encoding="utf-8")
        self.patch_root = mock.patch.object(planner, "ROOT", self.public)
        self.patch_baseline = mock.patch.object(planner, "BASELINE", self.baseline_file)
        self.patch_root.start()
        self.patch_baseline.start()
        self.addCleanup(self.patch_root.stop)
        self.addCleanup(self.patch_baseline.stop)

    def git(self, *args):
        result = subprocess.run(
            ["git", "-C", str(self.repo), *args],
            check=False, capture_output=True, timeout=15,
        )
        if result.returncode:
            self.fail("Local test Git operation failed: " + " ".join(args))
        return result.stdout

    def commit(self):
        self.git(
            "-c", "user.name=Demo Test",
            "-c", "user.email=demo@example.invalid",
            "commit", "-m", "Local test fixture",
        )

    def test_equal_line_endings_are_accepted(self):
        result = planner.plan(self.app)
        self.assertEqual(result["counts"]["MATCH"], 1)
        self.assertFalse(result["authorityGranted"])
        self.assertFalse(result["published"])

    def test_new_private_commit_prepares_review_package_not_public_update(self):
        self.source.write_bytes(b"export const example = 2;\n")
        self.git("add", "--", "app/src/example.ts")
        self.commit()
        result = planner.plan(self.app)
        self.assertEqual(result["counts"]["PRIVATE_CHANGE_REVIEW_REQUIRED"], 1)
        review = Path(self.temp.name) / "quarantine"
        prepared = planner.plan(self.app, stage_to=review)
        self.assertTrue(prepared["reviewPackageCreated"])
        self.assertEqual((review / "src/example.ts").read_bytes(), self.source.read_bytes())
        self.assertEqual(self.public_file.read_bytes(), b"export const example = 1;\r\n")
        self.assertFalse(prepared["published"])
        self.assertFalse(prepared["authorityGranted"])

    def test_uncommitted_private_change_fails_closed(self):
        self.source.write_bytes(b"export const example = 3;\n")
        with self.assertRaisesRegex(planner.GateError, "uncommitted"):
            planner.plan(self.app)

    def test_diverged_public_file_blocks_preparation(self):
        self.source.write_bytes(b"export const example = 2;\n")
        self.git("add", "--", "app/src/example.ts")
        self.commit()
        self.public_file.write_bytes(b"export const example = 'public fix';\n")
        result = planner.plan(self.app)
        self.assertEqual(result["counts"]["DIVERGED_MANUAL_MERGE_REQUIRED"], 1)
        with self.assertRaisesRegex(planner.GateError, "Diverged"):
            planner.plan(self.app, stage_to=Path(self.temp.name) / "quarantine")

    def test_new_review_destination_must_not_touch_either_repository(self):
        with self.assertRaises(planner.GateError):
            planner.plan(self.app, stage_to=self.public / "review")
        with self.assertRaises(planner.GateError):
            planner.plan(self.app, stage_to=self.repo / "review")

    def test_marker_blocks_review_copy_without_disclosing_secret(self):
        self.source.write_bytes(b"// -----BEGIN " + b"PRIVATE KEY-----\n")
        self.git("add", "--", "app/src/example.ts")
        self.commit()
        with self.assertRaisesRegex(planner.GateError, "disclosure marker"):
            planner.plan(self.app, stage_to=Path(self.temp.name) / "quarantine")


if __name__ == "__main__":
    unittest.main()
