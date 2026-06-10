import type { SimpleGit } from "simple-git";

import { isGitRepository } from "@/backend/utils/git";

type LoadBranchesInput = {
  showRemoteBranches: boolean;
  hard: boolean;
  currentRepo: string;
  gitPath: string;
};

/** The raw branch data. The `filter` field of the `loadBranches` response is
 *  attached by the message handler (from the per-repo filter store), not here:
 *  this query stays a pure git read. */
export type LoadBranchesResult = {
  branches: string[];
  head: string | null;
  hard: boolean;
  isRepo: boolean;
};

export async function loadBranches(
  git: SimpleGit,
  input: LoadBranchesInput
): Promise<LoadBranchesResult> {
  const { showRemoteBranches, hard, currentRepo, gitPath } = input;

  let branches: string[];
  let head: string | null;
  let error: boolean;

  try {
    const summary = await (showRemoteBranches ? git.branch() : git.branchLocal());
    head = summary.detached ? null : summary.current || null;
    branches = head ? [head, ...summary.all.filter((b) => b !== head)] : [...summary.all];
    error = false;
  } catch {
    branches = [];
    head = null;
    error = true;
  }

  const isRepo = error ? await isGitRepository(currentRepo, gitPath) : true;

  return { branches, head, hard, isRepo };
}
