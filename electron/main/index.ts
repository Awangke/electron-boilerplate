import { app, BrowserWindow } from "electron";
import path from "path";
// 引入winston模块
const { createLogger, format, transports } = require("winston");
const express = require("express");

// 创建一个新的logger实例
const logger = createLogger({
  // 设置默认的日志级别
  level: "info",
  // 设置日志格式
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf(
      (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // 定义传输方式 - 输出到控制台和文件
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});
let server: any = null;
function createServer() {
  const port = 15173; // 可以根据需要更改端口号
  const publicPath = path.join(__dirname, "../../", "dist"); // 指向您的前端资源目录

  const appExpress = express();
  appExpress.use(express.static(publicPath)); // 设置静态文件目录

  server = appExpress.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // createWindow(`http://localhost:${port}`);
  });
}
// 记录不同类型的信息
// logger.warn("This is a warning message");
// logger.error("This is an error message");
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false, // 确保未启用 Node.js 集成
      contextIsolation: true, // 启用上下文隔离
      preload: path.join(__dirname, "../preload/index.js"), // 如果有预加载脚本
      additionalArguments: ["--disable-http-cache"], // 可选参数
      // 设置 Content Security Policy
      webviewTag: false, // 禁止使用 <webview> 标签
      sandbox: true, // 使用沙箱模式
      // partition: "persist:your_app", // 可选，指定会话分区
      // 下面是设置 CSP 的方式之一
      // 但是 electron-builder 等工具推荐直接在 HTML 中设置
    },
  });

  // 发布时需换成生产域名
  let winURL = "";
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    winURL = path.join(__dirname, "../../", "dist/index.html");
    win.loadFile(winURL);
  } else {
    win.webContents.openDevTools();
    winURL = `http://localhost:5173/`;
    win.loadURL(winURL);
  }
  // logger.info(app.isPackaged + "---------" + process.env.NODE_ENV);

  // 等页面加载完打开
  win.once("ready-to-show", () => {
    win.show();
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (server) {
    server.close(); // 关闭服务器当所有窗口关闭时
  }
  if (process.platform !== "darwin") app.quit();
});
