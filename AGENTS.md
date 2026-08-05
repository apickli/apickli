# Repository Rules & Guidelines

## Product Context
- **Product Name**: `apickli`
- **Description**: A REST API integration testing framework and utility library built on top of `cucumber.js` using Gherkin BDD syntax for Node.js.
- **Primary Domain**: BDD API Integration Testing, Gherkin Step Definitions, HTTP Client Assertions, JSONPath/XPath evaluation, and OpenAPI/JSON Schema validation.

## Tech Stack & Tooling
- **Runtime**: Node.js (CommonJS, JavaScript ES6+)
- **BDD Framework**: `@cucumber/cucumber` (v11.x)
- **HTTP Engine**: `request` (v2.x)
- **Linter**: `eslint` (v8.x) with `eslint-config-google`
- **Core Source Location**: `./source`

### Key Operational Commands
- **Install Dependencies**: `cd source && npm install`
- **Linter**: `cd source && npm run lint` (`npx eslint .`)
- **Run Tests**: `cd source && npm run test` (`nohup node test/mock_target/app.js & npx cucumber-js test/ --tags @core`)
- **Run CI Pipeline**: `cd source && npm run ci`

> [!IMPORTANT]
> The active Node package, dependencies, and test suite are located inside the `source/` subdirectory. Always run `npm` scripts inside `source/` or pass `--prefix source`.

## Code Style & Architectural Conventions

### 1. Code Style & Formatting
- **Linting Rules**: Defined in `source/.eslintrc.json` extending `eslint-config-google`.
- **Module System**: CommonJS (`'use strict';`, `require()`, `module.exports`).
- **Formatting Guidelines**: Single quotes, mandatory semicolons, two-space indentation, strict variable scope declarations (`const`/`let`).

### 2. Architecture & File Roles
- **`source/apickli/apickli.js`**: Core domain logic class (`Apickli`) handling HTTP request composition, header/cookie management, variable interpolation, scenario/global scoping, and evaluation assertions (JSONPath, XPath, Schema validation).
- **`source/apickli/apickli-gherkin.js`**: Cucumber step bindings mapping Gherkin expressions (`Given`, `When`, `Then`) to `Apickli` instance methods.
- **`source/test/`**: Test suite comprising Cucumber `.feature` files, support code (`init.js`), mock TLS target (`mock_target/app.js`), and fixture files.

### 3. Testing & Contribution Conventions
- Preserve all public API contracts on `Apickli` and Gherkin step definition patterns.
- Async Gherkin steps must invoke Cucumber callbacks (`callback()` on success, `callback(prettyJson(assertion))` on failure).
- Ensure all new features or bug fixes are covered by Cucumber scenarios in `source/test/features/`.
