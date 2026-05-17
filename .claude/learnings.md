# rihua-ui 项目自我学习

## [测试] rstest 不自带 testing-library auto-cleanup

- **日期**: 2026-05-15
- **错误假设**: 以为 rstest（基于 Rspack/Rsbuild）跟 vitest/jest 一样会自动 unmount React 组件，让 `getByTestId` 在新测试里只能找到当前 render 的节点
- **正确做法**: 在 `rstest.setup.ts` 里显式加：
  ```ts
  import { afterEach } from '@rstest/core';
  import { cleanup } from '@testing-library/react';
  afterEach(() => cleanup());
  ```
  否则前面所有测试的 React 树都积累在 happy-dom 的 body 里，`getByTestId` 报 "Found multiple elements"
- **适用场景**: 任何在 rihua-ui 里写 `render(<X />)` 多个测试同名 testid 的组件库测试。新增组件的第一组测试写完跑通就要 verify 这个，避免后面 debug 浪费时间

## [构建] rslib dts 输出路径必须有独立的 build tsconfig 才能扁平

- **日期**: 2026-05-15
- **错误假设**: 以为 `bundle: false + dts: true` 会让 d.ts 跟 JS 一样扁平到 `dist/index.d.ts`
- **真实行为**: rslib 的 dts 生成走 tsc，tsc 的 `rootDir` 在没显式指定时取所有 `include` 的最近公共祖先。本仓 `tsconfig.json` 的 include 是 `["src", "docs", "rspress.config.ts"]`，公共祖先 = 项目根，所以 d.ts 跑到 `dist/src/index.d.ts`，跟 `dist/index.js` 不对称，`package.json#types: "./dist/index.d.ts"` 指空。
- **正确做法**: 加独立 `tsconfig.build.json`：
  ```json
  {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "rootDir": "src",
      "outDir": "dist",
      "declaration": true,
      "emitDeclarationOnly": true
    },
    "include": ["src"]
  }
  ```
  并在 `rslib.config.ts` 的 `source` 里加 `tsconfigPath: './tsconfig.build.json'`。这样 d.ts 就跟 JS 同样扁平。
- **适用场景**: 任何新组件改 `src/index.tsx` 时不用再担心 d.ts 路径漂移；如果未来要把组件库切分子入口（比如 `rihua-ui/number-input`），`exports` 里的 `types` 路径都按 `./dist/<sub>/index.d.ts` 写就对。
