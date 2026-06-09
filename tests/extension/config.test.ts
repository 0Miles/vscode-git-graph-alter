import * as assert from "node:assert";

import * as vscode from "vscode";

import { config } from "@/config";

// Guards the settings regroup/rename: every renamed accessor must still return
// its default (never undefined), and getRenamedConfig must honour the old flat
// key while letting the new grouped key win.
suite("config renamed settings", () => {
  const cfg = () => vscode.workspace.getConfiguration("git-graph-alter");
  const G = vscode.ConfigurationTarget.Global;
  const touched = [
    "showRemoteBranches",
    "repository.showRemoteBranches",
    "graphStyle",
    "graph.style"
  ];

  teardown(async () => {
    for (const k of touched) {
      await cfg().update(k, undefined, G); // eslint-disable-line no-await-in-loop
    }
  });

  test("renamed accessors return their defaults (never undefined)", () => {
    assert.strictEqual(config.showRemoteBranches(), true);
    assert.strictEqual(config.showTags(), true);
    assert.strictEqual(config.showUncommittedChanges(), true);
    assert.strictEqual(config.commitOrder(), "date");
    assert.strictEqual(config.graphStyle(), "rounded");
    assert.strictEqual(config.dateType(), "Author Date");
    assert.strictEqual(config.dateFormat(), "Date & Time");
    assert.strictEqual(config.initialLoadCommits(), 300);
    assert.deepStrictEqual(config.showSpecificBranches(), []);
    assert.ok(Array.isArray(config.graphColours()) && config.graphColours().length > 0);
  });

  test("reads the old flat key for backward compatibility", async () => {
    await cfg().update("showRemoteBranches", false, G);
    assert.strictEqual(config.showRemoteBranches(), false);
    await cfg().update("graphStyle", "angular", G);
    assert.strictEqual(config.graphStyle(), "angular");
  });

  test("new grouped key wins over the old flat key", async () => {
    await cfg().update("showRemoteBranches", false, G);
    await cfg().update("repository.showRemoteBranches", true, G);
    assert.strictEqual(config.showRemoteBranches(), true);
  });
});
