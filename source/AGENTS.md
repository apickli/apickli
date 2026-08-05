# Source Package Guidelines (`source/`)

## Architecture & Module Structure

- **`apickli/apickli.js`**: Core class for HTTP assertions.
  - Implements request state (`headers`, `cookies`, `queryParameters`, `formParameters`, `scenarioVariables`).
  - Implements response assertions for HTTP status codes, headers, body, XML/JSON parsing, JSONPath, XPath, and OpenAPI/JSON schemas.
- **`apickli/apickli-gherkin.js`**: Step definition layer for `@cucumber/cucumber`.
  - Exposes Gherkin regular expression bindings for `Given`, `When`, `Then` steps.
  - Handles assertion failure formatting using `prettyjson`.
- **`test/`**: Integration test scenarios.
  - `features/`: `.feature` files containing Gherkin test scenarios.
  - `mock_target/`: Express/HTTPS server (`app.js`) for mutual TLS and mock target testing.

## Linting & Code Quality
- Run `npm run lint` before committing any changes.
- Ensure strict adherence to `eslint-config-google` (2-space indent, mandatory semicolons, single quotes).
