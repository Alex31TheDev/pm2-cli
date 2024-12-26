"use strict";

const startApps = require("./apps.js");

const { connect, startCli } = require("./cli.js");
const handler = require("./handler.js");

async function main() {
    await connect();
    await startApps();
    startCli(handler);
}

main();
