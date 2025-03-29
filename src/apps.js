"use strict";

const { pm2StartAsync } = require("./pm2async.js");

async function startApps(ecosystem) {
    let numStarted = 0;

    for (const app of ecosystem.apps) {
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
