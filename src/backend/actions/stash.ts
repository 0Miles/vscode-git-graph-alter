import type { SimpleGit } from "simple-git";

import type { ActionPayload } from "@/backend/types";

/** Apply a stash to the working tree, keeping it in the stash list. With
 *  `reinstateIndex`, the stash's staged changes are restored to the index too. */
export async function applyStash(
  git: SimpleGit,
  input: ActionPayload<"applyStash">
): Promise<void> {
  const args = ["stash", "apply"];
  if (input.reinstateIndex) args.push("--index");
  args.push(input.selector);
  await git.raw(args);
}

/** Apply a stash and drop it from the stash list on success. */
export async function popStash(git: SimpleGit, input: ActionPayload<"popStash">): Promise<void> {
  const args = ["stash", "pop"];
  if (input.reinstateIndex) args.push("--index");
  args.push(input.selector);
  await git.raw(args);
}

/** Delete a stash from the stash list. */
export async function dropStash(git: SimpleGit, input: ActionPayload<"dropStash">): Promise<void> {
  await git.raw(["stash", "drop", input.selector]);
}

/** Rename a stash. Git has no native rename, so we resolve the stash's commit,
 *  drop the entry, then re-store it under the new message. The commit object
 *  survives the drop (it stays reachable until gc, which won't run in this
 *  window), so no work is lost. Caveat: `stash store` pushes onto the top of
 *  the stack, so a renamed stash moves to `stash@{0}`. */
export async function renameStash(
  git: SimpleGit,
  input: ActionPayload<"renameStash">
): Promise<void> {
  const hash = (await git.raw(["rev-parse", input.selector])).trim();
  await git.raw(["stash", "drop", input.selector]);
  try {
    await git.raw(["stash", "store", "-m", input.message, hash]);
  } catch (e: unknown) {
    // The drop succeeded but the re-store didn't: the stash is gone from the
    // list yet the commit is still reachable. Tell the user how to recover it.
    throw new Error(`stash store failed after drop; recover with: git stash store ${hash}`, {
      cause: e
    });
  }
}
