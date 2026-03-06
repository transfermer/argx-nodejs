const username = process.env.WEB_USERNAME || "admin";
const password = process.env.WEB_PASSWORD || "password";
const url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
const { spawn } = require("child_process");
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
const request = require("request");
const fs = require("fs");
const path = require("path");
const auth = require("basic-auth");

app.get("/", function (req, res) {
  res.send("hello world");
});

// 页面访问密码
app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Node"');
  return res.status(401).send();
});

// 获取系统进程表
app.get("/status", function (req, res) {
  let cmdStr = "ps -ef";
  const { exec } = require("child_process");
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统进程表：\n" + stdout + "</pre>");
    }
  });
});

// 获取系统监听端口
app.get("/listen", function (req, res) {
  let cmdStr = "ss -nltp";
  const { exec } = require("child_process");
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
    }
  });
});

//获取节点数据
app.get("/list", function (req, res) {
  let cmdStr = "cat list";
  const { exec } = require("child_process");
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>节点数据：\n\n" + stdout + "</pre>");
    }
  });
});

// 获取系统版本、内存信息
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  const { exec } = require("child_process");
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//文件系统只读测试
app.get("/test", function (req, res) {
  let cmdStr = 'mount | grep " / " | grep "(ro," >/dev/null';
  const { exec } = require("child_process");
  exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      res.send("系统权限为---非只读");
    } else {
      res.send("系统权限为---只读");
    }
  });
});

// 启动root
app.get("/root", function (req, res) {
  let cmdStr = "bash root.sh >/dev/null 2>&1 &";
  const { exec } = require("child_process");
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("root权限部署错误：" + err);
    } else {
      res.send("root权限执行结果：" + "启动成功!");
    }
  });
});

// keepalive begin
//web保活（改為單次啟動 entrypoint.sh，避免頻繁依賴系統命令）
function startEntrypointOnce() {
  if (!fs.existsSync('./entrypoint.sh')) return;
  try {
    const p = spawn('bash', ['./entrypoint.sh'], {
      detached: true,
      stdio: 'ignore'
    });
    p.unref();
    console.log('entrypoint.sh started (detached).');
  } catch (e) {
    console.error('Failed to start entrypoint.sh:', e);
  }
}

// 下载 web.js（保留，但加上存在檢查）
function download_web(callback) {
  let fileName = "web.js";
  let web_url =
    "https://github.com/fscarmen2/Argo-X-Container-PaaS/raw/main/files/web.js";
  if (fs.existsSync(path.join("./", fileName))) {
    return callback(null);
  }
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) {
        callback("下载文件失败");
      } else {
        callback(null);
      }
    });
}

download_web((err) => {
  if (err) {
    console.log("初始化-下载web文件失败");
  } else {
    console.log("初始化-下载web文件成功");
  }
  // 啟動 entrypoint（非阻塞）
  startEntrypointOnce();
});

// Argo 保活：改為嘗試啟動 cloudflared（由 entrypoint.sh 負責產生與啟動），此處不再使用 pgrep 反覆檢查
// keepalive end

// 下载 web 可执行文件的路由（保留）
app.get("/download", function (req, res) {
  download_web((err) => {
    if (err) {
      res.send("下载文件失败");
    } else {
      res.send("下载文件成功");
    }
  });
});

app.use(
  "/",
  createProxyMiddleware({
    changeOrigin: true,
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
    pathRewrite: {
      "^/": "/",
    },
    target: "http://127.0.0.1:8080/",
    ws: true,
  })
);

// 启动核心脚本（由 entrypoint.sh 產生並啟動需要的二進位）
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
