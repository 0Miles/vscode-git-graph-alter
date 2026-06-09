import { beforeAll, describe, expect, it } from "vitest";

import type { GitFileChange } from "@/backend/types";
import {
  alterGitFileTree,
  compactGitFileTree,
  generateGitFileListHtml,
  generateGitFileTree,
  generateGitFileTreeHtml
} from "@/webview/utils/fileTree";

function file(newFilePath: string): GitFileChange {
  return { oldFilePath: newFilePath, newFilePath, type: "M", additions: 0, deletions: 0 };
}

describe("generateGitFileTree", () => {
  it("builds a nested folder tree from file paths", () => {
    const tree = generateGitFileTree([file("src/a.ts"), file("src/sub/b.ts")]);
    const src = tree.children.get("src") as GitFolder;
    expect(src.type).toBe("folder");
    expect(src.folderPath).toBe("src");
    expect(src.children.get("a.ts")!.type).toBe("file");
    const sub = src.children.get("sub") as GitFolder;
    expect(sub.type).toBe("folder");
    expect(sub.children.get("b.ts")!.type).toBe("file");
  });

  it("records the file index for diff lookup", () => {
    const tree = generateGitFileTree([file("x.ts"), file("y.ts")]);
    expect((tree.children.get("y.ts") as GitFile).index).toBe(1);
  });
});

describe("compactGitFileTree", () => {
  it("collapses a chain of single-child folders into one node", () => {
    const tree = generateGitFileTree([file("a/b/c/deep.ts")]);
    compactGitFileTree(tree);
    const node = tree.children.get("a") as GitFolder;
    expect(node.name).toBe("a/b/c");
    expect(node.folderPath).toBe("a/b/c");
    expect(node.children.get("deep.ts")!.type).toBe("file");
  });

  it("does not collapse a folder that contains a file alongside a subfolder", () => {
    const tree = generateGitFileTree([file("a/file.ts"), file("a/sub/nested.ts")]);
    compactGitFileTree(tree);
    const a = tree.children.get("a") as GitFolder;
    expect(a.name).toBe("a");
    expect(a.children.get("file.ts")!.type).toBe("file");
    expect((a.children.get("sub") as GitFolder).name).toBe("sub");
  });

  it("collapses only the single-child prefix when the chain later branches", () => {
    const tree = generateGitFileTree([file("a/b/c/one.ts"), file("a/b/d/two.ts")]);
    compactGitFileTree(tree);
    const node = tree.children.get("a") as GitFolder;
    expect(node.name).toBe("a/b");
    expect(node.folderPath).toBe("a/b");
    expect((node.children.get("c") as GitFolder).name).toBe("c");
    expect((node.children.get("d") as GitFolder).name).toBe("d");
  });
});

describe("alterGitFileTree", () => {
  it("toggles a folder found by its folderPath", () => {
    const tree = generateGitFileTree([file("src/a.ts")]);
    alterGitFileTree(tree, "src", false);
    expect((tree.children.get("src") as GitFolder).open).toBe(false);
    alterGitFileTree(tree, "src", true);
    expect((tree.children.get("src") as GitFolder).open).toBe(true);
  });

  it("toggles a compacted folder by its (deepest) folderPath", () => {
    const tree = generateGitFileTree([file("a/b/c/deep.ts")]);
    compactGitFileTree(tree);
    // The compacted node keeps key "a" but its folderPath is "a/b/c".
    alterGitFileTree(tree, "a/b/c", false);
    expect((tree.children.get("a") as GitFolder).open).toBe(false);
  });

  it("does nothing for an unknown folderPath", () => {
    const tree = generateGitFileTree([file("src/a.ts")]);
    expect(() => alterGitFileTree(tree, "nope", true)).not.toThrow();
  });
});

describe("generateGitFileTreeHtml", () => {
  beforeAll(() => {
    // The renderer reads a handful of localized strings from the global l10n.
    (globalThis as { l10n?: unknown }).l10n = {
      tooltipBinaryFile: "Binary",
      tooltipRenamedTo: " renamed to ",
      copyFilePath: "Copy",
      openFile: "Open File",
      viewFileAtRevision: "View File at this Revision",
      viewDiffWithWorking: "View Diff with Working File",
      tooltipAdditions: " additions",
      tooltipAddition: " addition",
      tooltipDeletions: " deletions",
      tooltipDeletion: " deletion"
    };
  });

  it("omits change-type indicators when enhancedAccessibility is false", () => {
    const tree = generateGitFileTree([file("src/a.ts")]);
    const html = generateGitFileTreeHtml(tree, [file("src/a.ts")], false);
    expect(html).not.toContain("gitFileChangeTypeIndicator");
  });

  it("includes a change-type indicator when enhancedAccessibility is true", () => {
    const tree = generateGitFileTree([file("src/a.ts")]);
    const html = generateGitFileTreeHtml(tree, [file("src/a.ts")], true);
    expect(html).toContain('<span class="gitFileChangeTypeIndicator">M</span>');
  });

  describe("generateGitFileListHtml", () => {
    it("renders a flat, path-sorted list with full paths as labels", () => {
      const files = [file("src/z.ts"), file("a/early.ts")];
      const html = generateGitFileListHtml(files, false);
      expect(html).toContain('class="gitFileList"');
      // Full paths shown (not just file names), and no folder rows.
      expect(html).toContain("a&#x2F;early.ts");
      expect(html).toContain("src&#x2F;z.ts");
      expect(html).not.toContain("gitFolder");
      // Path-sorted: "a/early.ts" appears before "src/z.ts".
      expect(html.indexOf("a&#x2F;early.ts")).toBeLessThan(html.indexOf("src&#x2F;z.ts"));
    });

    it("renders the per-file action buttons", () => {
      const html = generateGitFileListHtml([file("x.ts")], false);
      expect(html).toContain('class="gitFileOpen"');
      expect(html).toContain('class="gitFileCopyPath"');
    });
  });

  it("renders Open File, View-at-Revision and Diff-with-Working buttons for non-deleted files", () => {
    const tree = generateGitFileTree([file("src/a.ts")]);
    const html = generateGitFileTreeHtml(tree, [file("src/a.ts")], false);
    expect(html).toContain('class="gitFileOpen"');
    expect(html).toContain('class="gitFileViewRev"');
    expect(html).toContain('class="gitFileDiffWorking"');
  });

  it("omits the Open File and View-at-Revision buttons for deleted files", () => {
    const deleted: GitFileChange = {
      oldFilePath: "gone.ts",
      newFilePath: "gone.ts",
      type: "D",
      additions: null,
      deletions: null
    };
    const tree = generateGitFileTree([deleted]);
    const html = generateGitFileTreeHtml(tree, [deleted], false);
    expect(html).not.toContain('class="gitFileOpen"');
    expect(html).not.toContain('class="gitFileViewRev"');
    // The copy-path button is still present.
    expect(html).toContain('class="gitFileCopyPath"');
  });
});
