"use strict";

process.env.PM2_LOG_DATE_FORMAT = "";
const startApps = require("./apps.js");

const { connect, startCli } = require("./cli.js");
const { handler, streamLogs } = require("./handler.js");

async function main() {
    await connect();
    await startApps();

    startCli(handler);
    await streamLogs();
}

main();
