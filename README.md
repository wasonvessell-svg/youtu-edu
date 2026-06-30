# 🎓 优途研学社 - 官网 + 后台管理系统

上海初高中辅导机构宣传网站，支持在线预约和管理后台。

## ✨ 功能

- **前台官网** — 品牌展示、名师介绍、课程定价、在线预约
- **管理后台** — 查看/删除预约记录，实时刷新
- **手机自适应** — 微信可直接打开

## 🚀 一键部署到 Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/wasonvessell-svg/youtu-edu)

点击上方按钮，用 GitHub 账号登录 Render，即可自动部署。

## 🛠 本地运行

```bash
npm install
cd backend && npm install && cd ..
npm start
```

然后打开：
- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin

## 📁 项目结构

```
├── index.html              # 前台官网
├── css/style.css           # 样式
├── js/main.js              # 前端交互
├── backend/
│   ├── app.js              # Express 服务器 + API
│   ├── package.json
│   └── data/
│       └── submissions.json # 预约数据
├── render.yaml             # Render 部署配置
├── ecosystem.config.js     # PM2 进程配置
└── 启动服务器.bat           # Windows 一键启动
```

## 📞 联系方式

- 电话：18324431866
- 微信：fuzhengjie2007
