import type { SimpleGit, SimpleGitOptions } from "simple-git";
import { simpleGit } from "simple-git";

export type GitClient = ReturnType<typeof gitClientFactory>;
export type GitInstance = GitClient["getInstance"];

function gitOptions(repoPath: string, gitPath: string): Partial<SimpleGitOptions> {
  return {
    baseDir: repoPath,
    binary: gitPath,
    maxConcurrentProcesses: 6,
    trimmed: false,
    // Disable coloured output on every command so user git config such as
    // color.branch = always can't inject ANSI escapes into the values we parse
    // (e.g. branch names in the dropdown). Per-command color.* settings take
    // precedence over color.ui, so each parsed command's key is set explicitly.
    // log.showSignature is likewise forced off: when a user enables it, git log
    // prepends GPG verification lines to each commit, corrupting our parsing.
    config: [
      "color.ui=false",
      "color.branch=false",
      "color.diff=false",
      "color.status=false",
      "color.decorate=false",
      "color.log=false",
      "log.showSignature=false"
    ],
    // Allow the GIT_ASKPASS helper we set below, and the GIT_EDITOR /
    // GIT_SEQUENCE_EDITOR we set on the instance (commands we control, not
    // external input). simple-git blocks askpass/editor env by default — and
    // without allowUnsafeEditor it rejects EVERY command once GIT_EDITOR is set.
    unsafe: { allowUnsafeAskPass: true, allowUnsafeEditor: true }
  };
}

/** Called for every spawned git command (binary + args), for logging. */
export type GitCommandHandler = (command: string, args: string[]) => void;

export function gitClientFactory(
  repoPath: string,
  gitPath: string,
  onCommand?: GitCommandHandler,
  // Extra environment for spawned git processes — e.g. the GIT_ASKPASS handles
  // for credential prompting. Scoped to this client's git children rather
  // than process.env so it can't leak to other extensions sharing the host.
  gitEnv?: NodeJS.ProcessEnv
) {
  const create = (): SimpleGit => {
    const instance = simpleGit(gitOptions(repoPath, gitPath));
    // The extension can never host an interactive editor, so force every git
    // child to a no-op editor. Without this, commands that would open one
    // (e.g. `merge`/`rebase`/`cherry-pick` `--continue`) hang the child
    // forever. GIT_EDITOR is the portable way to do this (cross-platform,
    // unlike a `core.editor=true` that relies on a `true` binary being on PATH).
    instance.env("GIT_EDITOR", "true");
    // Set each variable individually so it merges into the inherited
    // process.env; passing a whole object via env() replaces the environment
    // and makes simple-git scrutinise (and reject) inherited variables.
    if (gitEnv !== undefined) {
      for (const [key, value] of Object.entries(gitEnv)) {
        if (value !== undefined) instance.env(key, value);
      }
    }
    if (onCommand !== undefined) {
      instance.outputHandler((command, _stdout, _stderr, args) => onCommand(command, args));
    }
    return instance;
  };
  let git: SimpleGit = create();

  return {
    getInstance: (): SimpleGit => git,
    setRepo(newRepoPath: string) {
      repoPath = newRepoPath;
      git = create();
    },
    setGitPath(newGitPath: string) {
      gitPath = newGitPath;
      git = create();
    }
  };
}
