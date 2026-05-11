# 🧰 工具箱

一个集成各种实用工具的全栈网站。

## 技术栈

### 前端
- **Vue 3** — 渐进式 JavaScript 框架
- **Vite** — 极速开发构建工具
- **Vue Router** — 前端路由
- **TypeScript** — 类型安全

### 后端（待开发）
- **Go** — 高性能后端语言

## 快速开始

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`

### 构建生产版本

```bash
cd frontend
npm run build
```

### 后端（占位，待开发）

```bash
cd backend
go run main.go
```

## 项目结构

```
toolbox-site/
├── frontend/              # Vue3 + Vite 前端
│   ├── src/
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 通用组件
│   │   ├── router/        # 路由配置
│   │   ├── views/         # 页面视图
│   │   ├── App.vue        # 根组件
│   │   └── main.ts        # 入口文件
│   ├── public/            # 公共资源
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/               # Go 后端（占位）
│   ├── go.mod
│   └── main.go
└── README.md
```
