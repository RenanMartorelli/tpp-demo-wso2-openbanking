'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const apiJWT = require("./app/api/jwt");

require('dotenv').config()

var corsOptions = {
  origin: process.env.CORS_ALLOW_ORIGINS || "*",
}

express.application.prefix = express.Router.prefix = function (path, configure) {
  var router = express.Router();
  this.use(path, router);
  configure(router);
  return router;
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions))

apiJWT(app);

app.listen(8001, () => console.log("App listening on port 8001!"));
process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });