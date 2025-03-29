"use strict";

process.env.PM2_LOG_DATE_FORMAT = "";

const loadConfig = require("./src/config.js");
const ecosystem = require("./config/ecosystem.config.js");

const startApps = require("./src/apps.js");

const { connect, startCli } = require("./src/cli.js");
const { handler: cliHandler, streamLogs } = require("./src/cliHandler.js");

const { startServer } = require("./src/server.js");
const { handler: wsHander } = require("./src/wsHandler.js");

async function main() {
    const config = loadConfig();

    await connect(config);
    await startApps(ecosystem);

    startCli(cliHandler);

    if (config.websocketServer) {
        startServer(config, wsHander);
    }

    await streamLogs();
}

main();
