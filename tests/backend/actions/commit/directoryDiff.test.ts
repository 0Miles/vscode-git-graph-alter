import * as cp from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { simpleGit } from "simple-git";
import { afterEach, describe, expect, it } from "vitest";

import { openDirectoryDiff } from "@/backend/actions/commit";

import { git, makeRepo } from "@tests/backend/helpers";

let repo: string;

afterEach(() => {
  if (repo) fs.rmSync(repo, { recursive: true, force: true });
});

describe("openDirectoryDiff", () => {
  it("invokes the configured diff tool for the commit (vs its parent)", async () => {
    repo = makeRepo();
    // A no-op difftool ("true" exits 0) avoids launching/hanging a real GUI.
    git(["config", "diff.tool", "dummy"], repo);
    git(["config", "difftool.dummy.cmd", "true"], repo);
    git(["config", "difftool.prompt", "false"], repo);
    fs.writeFileSync(path.join(repo, "x.txt"), "x");
    git(["add", "."], repo);
    git(["commit", "-m", "second"], repo);
    const head = cp.execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();

    await expect(openDirectoryDiff(simpleGit(repo), { commitHash: head })).resolves.toBeUndefined();
  });
});
