const express = require('express');
const bodyParser = require("body-parser");
const ControllerHeartBeat = require("./controller/box_heartbeat_controller");
const ControllerFetchAllBoxes = require("./controller/fetch_allbox_controller");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.enable('trust proxy');//防止ip代理

app.post('/heartbeat/box/transmission/msg', ControllerHeartBeat.listener);

ControllerFetchAllBoxes.fetchAll();

var port = process.env.PORT || 8106;
app.listen(port);

console.log(`listen the port: ${8106}`);

module.exports = app;