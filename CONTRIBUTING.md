# Contributing to Apickli

*Thank you for considering contributing to apickli.*

---

## Reporting Issues

- **Check existing issues**: Ensure the bug or proposal was not already reported under [GitHub Issues](https://github.com/apickli/apickli/issues).
- **Open a detailed issue**: If no existing issue covers your topic, [open a new issue](https://github.com/apickli/apickli/issues/new) including a clear title, reproduction steps, expected vs. actual behavior, and code samples.

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `master`.
2. Follow existing code style guidelines (`eslint-config-google`).
3. Include tests covering any new functionality or bug fixes.
4. Ensure all linters and tests pass cleanly before submitting your PR.

---

## Development & Testing Commands

All standard commands can be executed from the repository root:

- **Install Dependencies**:
  ```sh
  npm install
  ```

- **Run Linter**:
  ```sh
  npm run lint
  ```
  *(Runs `npx eslint .` inside `./source`)*

- **Run Core Cucumber Tests**:
  ```sh
  npm run test
  ```
  *(Launches local mock HTTPS server and executes Cucumber BDD scenarios tagged `@core`)*

- **Run Full CI Pipeline**:
  ```sh
  npm run ci
  ```

---

## Code Style Conventions

- Code style is governed by `eslint` extending `eslint-config-google`.
- Use CommonJS modules (`'use strict';`, `require()`, `module.exports`).
- Maintain single quotes, mandatory semicolons, and two-space indentation.
- Preserve backward compatibility for public `Apickli` instance properties and Gherkin step expressions.

Thank you for your contribution!