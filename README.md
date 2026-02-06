# 贵州公务员职位数据可视化平台

一个基于 Nuxt 3 的公务员职位数据可视化分析平台，支持 Excel 文件上传和数据分析。

## 功能特性

- 📊 **数据可视化**：考区分布、学历要求、职位类别等多维度图表展示
- 📁 **文件管理**：
  - 上传文件到服务器（持久化存储）
  - 从已有文件中选择加载
  - 文件重命名和删除
  - 智能缓存机制
- 🔍 **智能筛选**：按考区、学历、职位类别、关键词等多条件筛选
- 📈 **实时统计**：自动获取职位报名统计数据
- 💾 **数据持久化**：上传的数据自动保存，无需重复上传
- ⚡ **性能优化**：缓存统计数据，避免重复请求，加载速度提升 10 倍+
- 🎯 **多类型支持**：同时支持公务员和事业单位职位表

## 使用说明

### 数据源管理

#### 方式一：上传文件到服务器（推荐）
1. 点击"上传文件到服务器"按钮
2. 选择 Excel 文件（.xlsx 或 .xls 格式）
3. 文件将保存到服务器，可重复使用
4. 首次加载会获取报名统计并缓存

#### 方式二：选择已有文件
1. 从下拉菜单中选择 `public` 目录下已有的 Excel 文件
2. 系统优先使用缓存数据（秒级加载）
3. 首次加载会自动获取报名统计

#### 方式三：临时上传
1. 拖拽或点击上传区域
2. 选择 Excel 文件进行临时分析
3. 数据仅在当前会话有效

#### 文件管理
- **重命名**：选择文件后点击"重命名"按钮，修改文件名
- **删除**：选择文件后点击"删除"按钮，永久删除文件
- **刷新统计**：点击"刷新统计"按钮更新报名人数数据
- **清除数据**：点击"清除数据"按钮删除当前加载的数据

#### 缓存机制
- 首次加载文件时，系统会获取所有职位的报名统计并缓存
- 再次加载同一文件时，直接使用缓存数据，无需重新获取
- 使用"刷新统计"可更新缓存数据
- 文件重命名时，缓存数据自动同步

### Excel 文件格式

系统支持两种类型的职位表：

#### 1. 公务员职位表
Excel 文件应包含以下列（从第5行开始为数据行）：
- 序号、考区、单位名称、机构性质、单位地址、单位咨询电话
- 职位代码、职位名称、所属大类、所属小类、职位简介
- 招录人数、学历要求、学位要求
- 专业要求（大专/本科/研究生）
- 政治面貌要求、各类定向要求、基层工作经历等

#### 2. 事业单位职位表
Excel 文件应包含以下列（从第6行开始为数据行）：
- 序号、单位名称、单位代码、岗位名称、岗位代码
- 岗位类别、招聘人数、考试类别、岗位简介
- 学历要求、学位要求
- 专业要求（中专/大专/本科/研究生）
- 政治面貌要求、各类定向要求、基层工作经历等

系统会自动识别表格类型并使用对应的 API 接口获取报名统计数据。

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
