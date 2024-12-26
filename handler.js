"use strict";

const pm2 = require("pm2");

const { help, next, disconnect } = require("./cli.js");

async function handler(line) {
    const [cmd, ...args] = line.trim().split(" ");

    const name = args[0],
        hasName = typeof name === "string" && name.length > 0;

    switch (cmd) {
        case "start":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
                next();
            } else {
                pm2.start(name, err => {
                    if (err) console.error("Error starting process:", err);
                    else console.log(`Process "${name}" started successfully.`);

                    next();
                });
            }

            break;

        case "stop":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
                next();
            } else {
                pm2.stop(name, err => {
                    if (err) console.error("Error stopping process:", err);
                    else console.log(`Process "${name}" stopped successfully.`);

                    next();
                });
            }

            break;

        case "restart":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
                next();
            } else {
                pm2.restart(name, err => {
                    if (err) console.error("Error restarting process:", err);
                    else console.log(`Process "${name}" restarted successfully.`);

                    next();
                });
            }

            break;

        case "delete":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
                next();
            } else {
                pm2.delete(name, err => {
                    if (err) console.error("Error deleting process:", err);
                    else console.log(`Process "${name}" deleted successfully.`);

                    next();
                });
            }

            break;

        case "list":
            pm2.list((err, list) => {
                if (err) console.error("Error fetching process list:", err);
                else {
                    const procTable = list.map(proc => ({
                        id: proc.pm_id,
                        name: proc.name,
                        status: proc.pm2_env.status
                    }));

                    console.table(procTable);
                }

                next();
            });

            break;

        case "exit":
            await disconnect();

            break;

        default:
            console.log("Unknown command.", help);

            next();
            break;
    }
}

module.exports = handler;
