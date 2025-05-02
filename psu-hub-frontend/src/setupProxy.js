/*  src/setupProxy.js
   CRA runs this file automatically when you `npm start` */
   const { createProxyMiddleware } = require('http-proxy-middleware');

   module.exports = function (app) {
     // REST + uploads
     app.use(
       '/api',
       createProxyMiddleware({
         target: 'http://localhost:3001',
         changeOrigin: true
       })
     );
   
     // Socket.io upgrade requests
     app.use(
       '/socket.io',
       createProxyMiddleware({
         target: 'http://localhost:3001',
         ws: true,
         changeOrigin: true
       })
     );
   };
   