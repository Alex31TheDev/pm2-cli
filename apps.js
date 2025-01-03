"use strict";

const { pm2StartAsync } = require("./pm2async.js");

const config = require("./ecosystem.config.js");

async function startApps() {
    let numStarted = 0;

    for (const app of config.apps) {
        let proc;

        try {
            proc = await pm2StartAsync(app);
        } catch (err) {
            console.error(`Error starting ${app.name}:`, err);
        }

        if (typeof proc !== "undefined") {
            console.log(`Successfully started ${app.name}.`);

            app.proc = proc;
            numStarted++;
        }
    }

    const s = numStarted > 1 ? "s" : "";
    console.log(`Started ${numStarted} app${s}.`);

    return numStarted;
}

module.exports = startApps;
