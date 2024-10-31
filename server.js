// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORSヘッダーの設定（必要に応じて調整）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 必要に応じて制限
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// プロキシエンドポイント
// 例: /proxy?url=http://example.com
app.get('/proxy', (req, res, next) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).send('URL parameter is required');
  }

  // URLのバリデーション（簡易）
  try {
    new URL(target);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }

  // プロキシミドルウェアの作成
  const proxy = createProxyMiddleware({
    target: target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const url = new URL(req.url, `${req.protocol}://${req.get('host')}`);
      return url.pathname;
    },
    onError: (err, req, res) => {
      res.status(500).send('Proxy Error');
    },
  });

  proxy(req, res, next);
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.send('Lightweight Web Proxy is running');
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
