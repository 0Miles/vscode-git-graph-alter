import { beforeAll, describe, expect, it, vi } from "vitest";

import { DEFAULT_CONTEXT_MENU_ACTIONS_VISIBILITY } from "@/backend/utils/contextMenuVisibility";
import type * as GG from "@/types";

import { createVscodeMock, setupHtml } from "./setup";

const REPO = "/workspace/my-repo";

const viewState: GG.GitGraphViewState = {
  autoCenterCommitDetailsView: true,

  commitDetailsViewLocation: "Inline",

  referenceLabelAlignment: "Normal",

  combineLocalAndRemoteBranchLabels: true,
  dialogDeleteBranchForceDelete: false,
  dialogCherryPickNoCommit: false,
  dialogAddTagType: "annotated",
  dialogCreateBranchCheckOut: false,
  dialogMergeNoFastForward: true,
  dialogMergeSquash: false,
  dialogResetMode: "mixed",
  customBranchGlobPatterns: [],
  contextMenuActionsVisibility: DEFAULT_CONTEXT_MENU_ACTIONS_VISIBILITY,
  customEmojiShortcodeMappings: {},
  dateFormat: "Date & Time",
  defaultColumnVisibility: { date: true, author: true, commit: true },
  enhancedAccessibility: false,
  fetchAvatars: false,
  fileTreeCompactFolders: true,
  fileViewType: "File Tree",
  graphColours: ["#0085d9"],
  graphStyle: "rounded",
  initialLoadCommits: 300,
  issueLinkingRegex: "",
  issueLinkingUrl: "",
  keybindings: { find: "f", refresh: "r", scrollToHead: "h", scrollToStash: "s" },
  lastActiveRepo: null,
  loadMoreAutomatically: false,
  loadMoreCommits: 75,
  markdown: false,
  muteCommitsNotAncestorsOfHead: false,
  muteMergeCommits: true,
  onLoadScrollToHead: false,
  referenceInputSpaceSubstitution: "None",
  repos: { [REPO]: { columnWidths: null } },
  showCurrentBranchByDefault: false,

  uncommittedChangesAtHead: false,
  showSpecificBranches: [],
  showRemoteBranches: false,
  showTags: true
};

describe("showRemoteBranches default", () => {
  beforeAll(async () => {
    vi.resetModules();
    createVscodeMock();
    setupHtml(viewState);
    await import("@/webview/main");
  });

  it("unchecks the Show Remote Branches box when the setting is false", () => {
    const checkbox = document.getElementById("showRemoteBranchesCheckbox") as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
  });
});
