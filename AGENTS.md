# 仓库指南

## 项目结构与模块组织
`src/` 包含应用代码。入口文件为 `src/main.js`、`src/App.vue` 和 `src/router/index.js`。路由视图位于 `src/views/`，其中模拟器流程按章节分组在 `src/views/simulators/phase1` 到 `phase4` 之下。可复用 UI 组件放在 `src/components/common/`。共享状态位于 `src/stores/`，API 与持久化逻辑位于 `src/services/`，IndexedDB 初始化相关代码位于 `src/db/`。静态资源分布在 `src/assets/` 与 `public/` 中。

## 构建、测试与开发命令
使用 `package.json` 中定义的脚本：

- `npm run dev` 或 `pnpm dev`：启动运行在 `5173` 端口上的 Vite 开发服务器。
- `npm run build` 或 `pnpm build`：在 `dist/` 目录中生成生产构建。
- `npm run preview` 或 `pnpm preview`：在本地启动已构建的应用以便验证。

当前仓库同时包含 `package-lock.json` 和 `pnpm-lock.yaml`；每次改动请只选择一种包管理器，并确保 lockfile 更新是有意为之。

## 编码风格与命名约定
遵循现有的 Vue 3 单文件组件模式，并使用 `<script setup>`。模板、样式与 JavaScript 统一使用 2 空格缩进。当前代码库倾向于使用不带分号的 JavaScript，变量和函数采用 camelCase 命名，Vue 组件文件名采用 PascalCase，例如 `Typewriter.vue`。新增模拟器模块时，请与所属章节放在一起，并使用具有描述性的文件夹名称，例如 `DreamLayer` 或 `LastWitness`。

在有助于提升可读性时，优先使用 `@` 别名来引用 `src/` 下的模块。

## 测试指南
当前项目尚未配置自动化测试套件。至少在提交改动前运行一次 `npm run build`，并在浏览器中手动验证受影响的路由、存档/读档流程，以及依赖 API 的交互。后续如果新增测试，请将测试文件放在对应功能附近，或放入专门的 `tests/` 目录中，并使用以 `.test.js` 结尾的命名方式。

## 提交与 Pull Request 指南
当前 Git 历史较少，因此提交信息请使用清晰的祈使句，例如：`Add phase 4 archive save handling`。每个提交应尽量聚焦于单一改动。Pull Request 应包含简短摘要、受影响的页面或模块、手动验证步骤，以及与 UI 改动相关的截图或录屏。如有对应 issue，也请一并关联。

## 配置说明
请谨慎检查对 `vite.config.js` 的修改，因为它控制着别名、PWA 行为，以及暴露在 `0.0.0.0:5173` 的开发服务器配置。不要提交真实的 API 密钥或任何与环境绑定的凭证信息。
