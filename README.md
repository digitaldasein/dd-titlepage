<!--
SPDX-FileCopyrightText: 2022 Digital Dasein <https://digital-dasein.gitlab.io/>
SPDX-FileCopyrightText: 2022 Gerben Peeters <gerben@digitaldasein.org>
SPDX-FileCopyrightText: 2022 Senne Van Baelen <senne@digitaldasein.org>

SPDX-License-Identifier: MIT
-->

# \<dd-titlepage>

[![pipeline](https://gitlab.com/digital-dasein/software/html-presentations/dd-titlepage/badges/main/pipeline.svg?job=build&key_text=build)](https://gitlab.com/digital-dasein/software/html-presentations/dd-titlepage/-/pipelines)
[![coverage](https://gitlab.com/digital-dasein/software/html-presentations/dd-titlepage/badges/main/coverage.svg?job=test)](https://digital-dasein.gitlab.io/software/html-presentations/dd-titlepage/lcov-report/)
[![REUSE 
status](https://api.reuse.software/badge/gitlab.com/digital-dasein/software/html-presentations/dd-titlepage)](https://api.reuse.software/info/gitlab.com/digital-dasein/software/html-presentations/dd-titlepage)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
yarn add @digitaldasein/dd-titlepage
```
or

```bash
npm i @digitaldasein/dd-titlepage
```

## Usage

```html
<script type="module">
  import 'path/to/dd-titlepage.js';
</script>

<dd-titlepage></dd-titlepage>
```

## Local Demo with `web-dev-server`

```bash
yarn start
```

To run a local development server that serves the basic demo located in 
`demo/index.html`

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
yarn lint
```

To automatically fix linting and formatting errors, run

```bash
yarn format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
yarn test
```

To run the tests in interactive watch mode run:

```bash
yarn test:watch
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to 
individual files.
