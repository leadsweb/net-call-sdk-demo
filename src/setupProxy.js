const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/voipcall_token',
    createProxyMiddleware({
      target: 'http://crm.leads.qq.com',
      changeOrigin: true,
      secure: false,
    })
  );
  app.use(
    '/voipcall',
    createProxyMiddleware({
      target: 'http://crm.leads.qq.com',
      changeOrigin: true,
      secure: false,
    })
  );
};
