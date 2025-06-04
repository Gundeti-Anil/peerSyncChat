# Contributing to PeerSync

Here are some guidelines to follow to ensure consistency, clarity, and quality in our codebase.

## General Guidelines

- **Use pnpm**: PeerSync uses `pnpm` as the package manager. **Do not use npm or yarn**.
- **Branch Environments**:

  - The `main` branch is the **production environment** ([peersync.vercel.app](https://peersync.vercel.app); will deploy to [peersync.in](https://peersync.in) soon).

  - The `develop` branch is the **development environment** ([peersync-dev.vercel.app](https://peersync-dev.vercel.app)).

- **Branching Strategy**:
  - Never push directly to the `main` or `develop` branches.
  - This is enforced using Husky Git Hooks, but even if you know how to bypass it, **please do not**. Always create a branch from `develop`. Name your branch according to your issue ID in [Linear](https://linear.app/peersync) (e.g., `PS-12`).

## Pull Request Process

- **Pull Request (PR) Creation**:
  - Always raise a Pull Request from your branch to the `develop` branch (e.g., `PS-12 -> develop`).
- **Review Process**:
- Do **not** merge your own PRs. Request a review from [Lokesh](https://github.com/lokesh-7977) and post your PRs to our `#dev` channel on [Discord](https://discord.gg/your-discord-invite).
- We will review your code and add comments if necessary. Once all comments are addressed, we will mark them as resolved, approve the PR, and close the PR.

## GitHub Organisation and Rulesets

- While GitHub Organisation features have rulesets that enforce the above guidelines (such as preventing direct merges or pushes to `main` or `develop`), we are not using GitHub Organisation due to the downside of needing a Vercel Pro plan to deploy repos created inside a GitHub Organisation.
- **Trust and Responsibility**: We trust you to follow these guidelines, including not merging your own PRs and requesting reviews as outlined above.

## Commit Messages

All commits should follow a standardized format based on the [Conventional Commits](https://www.conventionalcommits.org/) specification and Angular's [commit message guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit). This ensures that our commit history is readable, searchable, and helps with automated versioning and changelog generation.

### Message Specification

Each commit message should be structured as follows:

```text
<type>(<scope>): <subject>
```

### `<type> (REQUIRED)`

The type of commit. Choose one of the following:

- **`feat`**: A new feature.
- **`fix`**: A bug fix.
- **`build`**: Changes that affect the build system or external dependencies (e.g., updating pnpm lockfile, modifying build scripts).
- **`ci`**: Changes to CI configuration files and scripts (e.g., GitHub Actions, Husky hooks).
- **`docs`**: Documentation only changes (e.g., README updates, inline code comments).
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **`refactor`**: A code change that neither fixes a bug nor adds a feature (e.g., code structure improvements, renaming variables).
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`chore`**: Routine tasks, maintenance, or other changes that don’t modify source or test files (e.g., updating dependencies, minor tooling changes).

> **Tip:** Use the most specific type that matches your change. For example, if you update a README file, use `docs`, not `chore`.

### `<scope> (OPTIONAL)`

The scope of the commit, e.g., a specific module, function, or file that the changes pertain to. This helps in understanding the area affected by the commit. Consider the perspective of the person reading source control or change logs.

- Should be blank (without parens) when there is no clear focus.

Examples of scopes:

- `landing`, `auth`, `api`, `ui`, `core`, `deps`, etc.

### `<subject> (REQUIRED)`

A brief summary of the changes. This should convey the "what" of the commit.

- Must be under 50 characters.
- Use the imperative, present tense (e.g., "Add feature" not "Added feature").
- Do not capitalize.
- Do not end with a period.
- Do not include PR, issue, or other ticket numbers.

Examples of subjects:

- `add authentication`
- `fix date formatting`
- `update dependencies`
- `refactor code`
- `add unittests`
- `update documentation`

## Example Commit Messages

- **Feature**: `feat(auth): add OAuth2 authentication`
- **Bug Fix**: `fix(ui): correct button alignment on small screens`
- **Documentation**: `docs(readme): update installation instructions`
- **Refactor**: `refactor(api): simplify request handling logic`
- **Test**: `test(auth): add unit tests for OAuth2 module`
- **Chore**: `chore(deps): update dependencies`

## Additional Notes

- **Rebase/Squash Commits**: When working on a feature branch, please rebase your commits to maintain a clean and readable history. If multiple small commits are made during development, squash them into a single meaningful commit before merging.
- **Branch Naming**: Your branch should be named as per your issue ID in Linear (e.g., `PS-12`). This helps in easily identifying the purpose and context of the branch.

We appreciate your contributions and look forward to collaborating with you!
