---
name: apickli-test-runner
description: Runs and verifies apickli REST API integration tests using Cucumber.js and the local mock target server. Use when adding Gherkin feature files, testing API step definitions, or validating apickli assertions.
---

# Apickli Test Runner Skill

## Purpose
The `apickli-test-runner` skill provides standard workflows for running linters, launching mock targets, and executing Cucumber BDD scenarios in `apickli` projects.

---

## Key Functions

1. **Workspace Script Execution**:
   - Executes root workspace commands (`npm run lint`, `npm run test`, `npm run ci`) delegating to `./source/`.

2. **Mock Target & Feature Execution**:
   - Ensures mock HTTPS target server (`source/test/mock_target/app.js`) is active during test execution.
   - Executes `@cucumber/cucumber` against feature files in `source/test/features/`.

---

## Step-by-Step Instructions for Agents

1. **Lint Check**:
   ```sh
   npm run lint
   ```
2. **Integration Test Suite**:
   ```sh
   npm run test
   ```
3. **Full CI Pipeline**:
   ```sh
   npm run ci
   ```

---

## Deliverables
- Clean test execution logs with scenario pass/fail counts.
