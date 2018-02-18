'use strict';
const restify = require('restify');
const server = restify.createServer();
const port = process.env.PORT || 3000;
server.listen(port, () => console.log('endpoint is http://localhost:%s', port));