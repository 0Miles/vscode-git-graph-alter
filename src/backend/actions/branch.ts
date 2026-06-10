import type { SimpleGit } from "simple-git";

import type { ActionPayload } from "@/backend/types";

export async function createBranch(
  git: SimpleGit,
  input: ActionPayload<"createBranch">
): Promise<void> {
  if (input.checkout) {
    // -B resets an existing branch to the commit (replace); -b fails if it exists.
    await git.raw(["checkout", input.force ? "-B" : "-b", input.branchName, input.commitHash]);
  } else {
    const args = ["branch"];
    if (input.force) args.push("-f");
    args.push(input.branchName, input.commitHash);
    await git.raw(args);
  }
}

export async function deleteBranch(
  git: SimpleGit,
  input: ActionPayload<"deleteBranch">
): Promise<void> {
  await git.deleteLocalBranch(input.branchName, input.forceDelete);
  if (input.deleteOnRemotes) {
    const remotes = await git.getRemotes();
    await Promise.all(
      remotes.map(async (remote) => {
        // Only delete on remotes that actually have the branch.
        const refs = await git.raw(["ls-remote", "--heads", remote.name, input.branchName]);
        if (refs.trim() !== "") {
          await git.raw(["push", remote.name, "--delete", input.branchName]);
        }
      })
    );
  }
}

export async function pullBranch(
  git: SimpleGit,
  input: ActionPayload<"pullBranch">
): Promise<void> {
  await git.pull(input.remote, input.branchName);
}

export async function pushBranch(
  git: SimpleGit,
  input: ActionPayload<"pushBranch">
): Promise<void> {
  const opts =
    input.forceMode === "force"
      ? ["--force"]
      : input.forceMode === "forceWithLease"
        ? ["--force-with-lease"]
        : [];
  // Push to each selected remote; simple-git serialises them internally.
  await Promise.all(input.remotes.map((remote) => git.push(remote, input.branchName, opts)));
}

export async function deleteRemoteBranch(
  git: SimpleGit,
  input: ActionPayload<"deleteRemoteBranch">
): Promise<void> {
  await git.raw(["push", input.remote, "--delete", input.branchName]);
}

export async function fetchIntoLocalBranch(
  git: SimpleGit,
  input: ActionPayload<"fetchIntoLocalBranch">
): Promise<void> {
  const args = ["fetch"];
  if (input.force) args.push("--force");
  args.push(input.remote, `${input.remoteBranch}:${input.localBranch}`);
  await git.raw(args);
}

export async function renameBranch(
  git: SimpleGit,
  input: ActionPayload<"renameBranch">
): Promise<void> {
  await git.raw(["branch", "-m", input.oldName, input.newName]);
}

/** Fast-forward a (non-checked-out) local branch up to its configured upstream
 *  without switching to it. `git fetch .` refuses a non-fast-forward update, so
 *  this can never rewrite or lose history; it errors if the branch has no
 *  upstream or is the current branch (git won't fetch into a checked-out ref). */
export async function fastForwardBranch(
  git: SimpleGit,
  input: ActionPayload<"fastForwardBranch">
): Promise<void> {
  const upstream = (
    await git.raw([
      "rev-parse",
      "--abbrev-ref",
      "--symbolic-full-name",
      `${input.branchName}@{upstream}`
    ])
  ).trim();
  await git.raw(["fetch", ".", `${upstream}:${input.branchName}`]);
}

export async function checkoutBranch(
  git: SimpleGit,
  input: ActionPayload<"checkoutBranch">
): Promise<void> {
  if (input.remoteBranch === null) {
    await git.checkout(input.branchName);
  } else {
    await git.checkoutBranch(input.branchName, input.remoteBranch);
  }
}

