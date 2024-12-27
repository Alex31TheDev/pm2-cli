"use strict";

const pm2 = require("pm2");

const util = require("util");

const pm2ConnectAsync = util.promisify(pm2.connect.bind(pm2)),
    pm2DisconnectAsync = util.promisify(pm2.disconnect.bind(pm2));

const pm2StartAsync = util.promisify(pm2.start.bind(pm2)),
    pm2StopAsync = util.promisify(pm2.stop.bind(pm2)),
    pm2RestartAsync = util.promisify(pm2.restart.bind(pm2)),
    pm2DeleteAsync = util.promisify(pm2.delete.bind(pm2));

const pm2ListAsync = util.promisify(pm2.list.bind(pm2));

const pm2LaunchBusAsync = util.promisify(pm2.launchBus.bind(pm2)),
    pm2DisconnectBusAsync = util.promisify(
        function (cb) {
            this.disconnectBus((...args) => {
                this.sub_sock = null;
                cb(...args);
            });
        }.bind(pm2.Client)
    );

module.exports = {
    pm2ConnectAsync,
    pm2DisconnectAsync,

    pm2StartAsync,
    pm2StopAsync,
    pm2RestartAsync,
    pm2DeleteAsync,

    pm2ListAsync,

    pm2LaunchBusAsync,
    pm2DisconnectBusAsync
};
