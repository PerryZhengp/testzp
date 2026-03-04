# 下100层 - Browser Edition

纯前端版本（`HTML + CSS + JavaScript`），无需 Python 或第三方依赖。

## 本地运行

直接双击打开 `/Users/perry/Documents/zptest/index.html` 即可开始玩。

如果你想走本地服务方式（推荐，避免某些浏览器安全策略问题）：

```bat
cd /d /Users/perry/Documents/zptest
python -m http.server 8000
```

然后访问：`http://localhost:8000`

## 操作说明

- 左右移动：`A / D` 或 `← / →`
- 失败或通关后重开：`R`

## 平台类型

- 蓝色：普通平台
- 橙色：脆弱平台（踩一次消失）
- 红色：尖刺平台（碰到即失败）

## 云端部署（快速）

### 方案 1: GitHub Pages

1. 新建 GitHub 仓库并上传 `index.html`、`style.css`、`game.js`。
2. 在仓库 `Settings -> Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. 选择 `main` 分支和根目录 `/`，保存。
5. 约 1-2 分钟后，会得到在线地址：`https://你的用户名.github.io/仓库名/`。

### 方案 2: Vercel

1. 登录 [https://vercel.com](https://vercel.com)。
2. `Add New -> Project`，导入你的仓库。
3. Framework 选 `Other`，不需要构建命令。
4. 一键部署后得到线上地址。
