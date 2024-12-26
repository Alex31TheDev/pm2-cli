"use strict";

const pm2 = require("pm2");

const util = require("util");

const pm2ConnectAsync = util.promisify(pm2.connect.bind(pm2)),
    pm2DisconnectAsync = util.promisify(pm2.disconnect.bind(pm2)),
    pm2StartAsync = util.promisify(pm2.start.bind(pm2));

module.exports = {
    pm2ConnectAsync,
    pm2DisconnectAsync,
    pm2StartAsync
};
