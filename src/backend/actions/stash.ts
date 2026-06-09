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
