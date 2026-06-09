import * as cp from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { simpleGit } from "simple-git";
import { afterEach, describe, expect, it } from "vitest";

import { checkoutAndPullBranch } from "@/backend/actions/branch";

import { git, makeRepo } from "@tests/backend/helpers";

let repo: string;
let bare: string;
let other: string;

afterEach(() => {
  for (const d of [repo, bare, other]) if (d) fs.rmSync(d, { recursive: true, force: true });
});

function currentBranch(dir: string): string {
  return cp
    .execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: dir })
    .toString()
    .trim();
}

describe("checkoutAndPullBranch", () => {
  it("checks out the branch and pulls new commits from its upstream", async () => {
    repo = makeRepo();
    bare = fs.mkdtempSync(path.join(os.tmpdir(), "neo-bare-"));
    cp.execFileSync("git", ["init", "--bare", "--initial-branch=main"], { cwd: bare });
    git(["remote", "add", "origin", bare], repo);
    git(["push", "-u", "origin", "main"], repo);
    git(["checkout", "-b", "feature"], repo);
    git(["push", "-u", "origin", "feature"], repo);
    git(["checkout", "main"], repo); // leave a different branch checked out

    // Another clone advances feature on the remote.
    other = fs.mkdtempSync(path.join(os.tmpdir(), "neo-other-"));
    cp.execFileSync("git", ["clone", "-b", "feature", bare, other]);
    cp.execFileSync("git", ["config", "user.email", "o@o.com"], { cwd: other });
    cp.execFileSync("git", ["config", "user.name", "O"], { cwd: other });
    fs.writeFileSync(path.join(other, "x"), "x");
    cp.execFileSync("git", ["add", "."], { cwd: other });
    cp.execFileSync("git", ["commit", "-m", "remote commit"], { cwd: other });
    cp.execFileSync("git", ["push", "origin", "feature"], { cwd: other });

    await checkoutAndPullBranch(simpleGit(repo), { branchName: "feature" });

    expect(currentBranch(repo)).toBe("feature"); // checked out
    const log = cp.execFileSync("git", ["log", "--oneline"], { cwd: repo }).toString();
    expect(log).toContain("remote commit"); // pulled
  });

  it("throws when the branch has no upstream configured", async () => {
    repo = makeRepo();
    git(["checkout", "-b", "orphan"], repo); // local-only branch, no upstream

    await expect(
      checkoutAndPullBranch(simpleGit(repo), { branchName: "orphan" })
    ).rejects.toThrow();
  });
});
