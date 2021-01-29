const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const password = process.env.PROXY_PASSWORD;
  const username = process.env.PROXY_USERNAME;

  if (!password || !username) {
    console.log("Please set PROXY_PASSWORD and PROXY_USERNAME variables!");
    process.exit(1);
  }

  const proxyMiddleware = createProxyMiddleware({
    target: 'https://nxt3.staging.lizard.net/',
//    target: 'https://demo.lizard.net/',
    changeOrigin: true,
    // Use HTTP basic auth, works with Lizard only
    auth: `${username}:${password}`
  });

  app.use('/api', proxyMiddleware);
  app.use('/bootstrap', proxyMiddleware);
  app.use('/wms', proxyMiddleware);
};
