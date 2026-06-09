import type {
  CommitOrdering,
  GitCommitDetails,
  GitCommitNode,
  GitFileChange,
  GitTagDetails
} from "./git.types";

type QueryPayloads = {
  commitDetails: {
    request: { repo: string; commitHash: string; isStash?: boolean };
    response: { commitDetails: GitCommitDetails | null };
  };
  /** Files changed between two arbitrary commits. */
  compareCommits: {
    request: { repo: string; fromHash: string; toHash: string };
    response: { fromHash: string; toHash: string; fileChanges: GitFileChange[] | null };
  };
  loadBranches: {
    request: { showRemoteBranches: boolean; hard: boolean };
    response: { branches: string[]; head: string | null; hard: boolean; isRepo: boolean };
  };
  loadRemotes: {
    request: Record<never, never>;
    response: { remotes: string[]; pushDefault: string | null };
  };
  tagDetails: {
    request: { repo: string; tagName: string };
    response: { details: GitTagDetails | null };
  };
  loadCommits: {
    request: {
      repo: string;
      /** Branch refs to show commits from. A single `""` means all
       *  branches; entries may be branch names or `glob:<pattern>` markers. */
      branchNames: string[];
      maxCommits: number;
      showRemoteBranches: boolean;
      hard: boolean;
      commitOrder?: CommitOrdering;
      /** Remote names whose branches are hidden. */
      hiddenRemotes?: string[];
    };
    response: {
      commits: GitCommitNode[];
      head: string | null;
      moreCommitsAvailable: boolean;
      hard: boolean;
    };
  };
};

export type QueryRequest = {
  [K in keyof QueryPayloads]: { command: K } & QueryPayloads[K]["request"];
}[keyof QueryPayloads];

export type QueryResponse = {
  [K in keyof QueryPayloads]: { command: K } & QueryPayloads[K]["response"];
}[keyof QueryPayloads];

export type QueryResult<T extends keyof QueryPayloads> = QueryPayloads[T]["response"];
