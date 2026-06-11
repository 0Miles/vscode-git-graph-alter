import { beforeAll, describe, expect, it, vi } from "vitest";

import type { GitCommitNode } from "@/backend/types";
import { DEFAULT_CONTEXT_MENU_ACTIONS_VISIBILITY } from "@/backend/utils/contextMenuVisibility";
import type * as GG from "@/types";

import { createVscodeMock, receive, setupHtml } from "./setup";

const REPO = "/workspace/my-repo";

const viewState: GG.GitGraphViewState = {
  autoCenterCommitDetailsView: true,
  commitDetailsViewLocation: "Inline",
  referenceLabelAlignment: "Normal",
  combineLocalAndRemoteBranchLabels: false,
  dialogDeleteBranchForceDelete: false,
  dialogCherryPickNoCommit: false,
  dialogAddTagType: "annotated",
  dialogCreateBranchCheckOut: false,
  dialogMergeNoFastForward: true,
  dialogMergeSquash: false,
  dialogResetMode: "mixed",
  dialogMemory: {},
  contextMenuActionsVisibility: DEFAULT_CONTEXT_MENU_ACTIONS_VISIBILITY,
  customBranchGlobPatterns: [],
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
  showRemoteBranches: true,
  showTags: true
};

// A child (on main) with a single parent, so Revert offers a plain Yes/Cancel
// confirmation while Merge offers an option-bearing form dialog.
const commits: GitCommitNode[] = [
  {
    hash: "child1",
    parentHashes: ["par1"],
    author: "Alice",
    email: "alice@example.com",
    date: 1700000100,
    message: "Child",
    refs: [{ hash: "child1", name: "main", type: "head" }]
  },
  {
    hash: "par1",
    parentHashes: [],
    author: "Alice",
    email: "alice@example.com",
    date: 1700000000,
    message: "Parent",
    refs: []
  }
];

function openCommitMenu(hash: string) {
  const row = document.querySelector<HTMLElement>(`tr.commit[data-hash="${hash}"]`);
  expect(row).not.toBeNull();
  row!.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
}

function clickMenuItem(startsWith: string) {
  const items = Array.from(document.querySelectorAll<HTMLElement>("#contextMenu li"));
  const item = items.find((li) => (li.textContent ?? "").trim().startsWith(startsWith));
  if (!item) {
    throw new Error(
      `menu item "${startsWith}" not found; items: ${items.map((i) => i.textContent).join(" | ")}`
    );
  }
  item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("'Remember my choice' checkbox visibility", () => {
  beforeAll(async () => {
    vi.resetModules();
    createVscodeMock();
    setupHtml(viewState);
    await import("@/webview/main");
    receive({
      command: "loadBranches",
      branches: ["main"],
      head: "main",
      hard: true,
      isRepo: true,
      filter: []
    });
    receive({ command: "loadRemotes", remotes: [], pushDefault: null });
    receive({
      command: "loadCommits",
      commits,
      head: "child1",
      moreCommitsAvailable: false,
      hard: true
    });
  });

  it("shows the checkbox on an option-bearing dialog (Merge)", () => {
    openCommitMenu("par1");
    clickMenuItem("Merge");

    // The three merge option checkboxes render as dialogInput0..2,
    // and the remember toggle renders alongside them.
    expect(document.getElementById("dialogInput0")).not.toBeNull();
    expect(document.getElementById("dialogRememberChoice")).not.toBeNull();
  });

  it("does NOT show the checkbox on a plain Yes/Cancel confirmation (Revert)", () => {
    // Dismiss the merge dialog first.
    document.getElementById("dialogDismiss")?.dispatchEvent(new MouseEvent("click"));

    openCommitMenu("child1");
    clickMenuItem("Revert");

    expect(document.getElementById("dialogRememberChoice")).toBeNull();
  });
});
