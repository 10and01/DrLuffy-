#!/usr/bin/env node

const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = Number(portArg ? portArg.split("=")[1] : process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function safeJoin(urlPath) {
  const normalized = path.normalize(urlPath).replace(/^([.][.][/\\])+/, "");
  return path.join(rootDir, normalized);
}

function resolveFile(urlPath) {
  let filePath = safeJoin(urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    if (!path.extname(filePath)) {
      const htmlCandidate = `${filePath}.html`;
      if (fs.existsSync(htmlCandidate)) {
        return htmlCandidate;
      }
    }
    return path.join(rootDir, "index.html");
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const targetPath = resolveFile(urlPath === "/" ? "/index.html" : urlPath);

  fs.readFile(targetPath, (error, data) => {
    if (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Internal Server Error");
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`[Drluffy] server running: http://localhost:${port}`);
});
