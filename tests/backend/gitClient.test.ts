import * as fs from "node:fs";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { gitClientFactory } from "@/backend/gitClient";

import { makeRepo } from "@tests/backend/helpers";

describe("gitClientFactory (real git)", () => {
  let repo: string;
  beforeAll(() => {
    repo = makeRepo();
  });
  afterAll(() => {
    fs.rmSync(repo, { recursive: true, force: true });
  });

  it("runs commands with GIT_EDITOR set (needs unsafe.allowUnsafeEditor)", async () => {
    // The factory bakes in GIT_EDITOR=true; without unsafe.allowUnsafeEditor,
    // simple-git rejects EVERY command, which blanked the whole graph.
    const client = gitClientFactory(repo, "git");
    const head = await client.getInstance().raw(["rev-parse", "HEAD"]);
    expect(head.trim()).toMatch(/^[0-9a-f]{40}$/);
  });
});
