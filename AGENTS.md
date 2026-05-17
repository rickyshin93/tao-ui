# AGENTS.md

You are an expert in JavaScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Commands

- `bun run build` - Build the library for production
- `bun run dev` - Turn on watch mode, watch for changes and rebuild the library

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rspress: https://rspress.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt

## Tools

### Biome

- Run `bun run lint` to lint your code
- Run `bun run format` to format your code

### Rspress

- Run `bun run doc` to start the Rspress documentation dev server, which will also start Rslib in watch mode
- Run `bun run doc:build` to build the documentation

### Storybook

- Run `bun run storybook` to start Storybook development server
- Run `bun run build:storybook` to build Storybook for production

### Rstest

- Run `bun run test` to run tests
- Run `bun run test:watch` to run tests in watch mode
