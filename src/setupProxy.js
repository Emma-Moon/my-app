const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
      '/api', // 요청 URL을 `/api`로 설정 (API 호출 시 /api로 시작하는 요청을 프록시)
      createProxyMiddleware({
        target: 'https://healingpaper.testrail.io',  // 실제 API 서버
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '',
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log('프록시 요청:', req.method, req.url);
          // Basic Authentication을 헤더에 추가
          proxyReq.setHeader('Authorization', `Basic ${process.env.REACT_APP_TESTRAIL_API_PASSWORD}`);
          proxyReq.setHeader('Accept', 'application/json');
          proxyReq.setHeader('Content-Type', 'application/json');
        },
        // CORS 헤더 설정
        onProxyRes: (proxyRes, req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인에서의 접근 허용
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // 허용하는 HTTP 메서드 설정
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 허용하는 헤더 설정
        }
      })
  );
};
