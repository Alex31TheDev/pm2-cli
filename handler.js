"use strict";

const pm2 = require("pm2");

const {
    pm2StartAsync,
    pm2StopAsync,
    pm2RestartAsync,
    pm2DeleteAsync,
    pm2ListAsync,
    pm2LaunchBusAsync,
    pm2DisconnectBusAsync
} = require("./pm2async.js");
const { help, next, disconnect } = require("./cli.js");

async function handler(line) {
    const [cmd, ...args] = line.trim().split(" ");

    const name = args[0],
        hasName = typeof name === "string" && name.length > 0;

    switch (cmd) {
        case "start":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
            } else {
                try {
                    await pm2StartAsync(name);
                    console.log(`Process "${name}" started successfully.`);
                } catch (err) {
                    console.error("Error starting process:", err.message);
                }
            }

            next();
            break;

        case "stop":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
            } else {
                try {
                    await pm2StopAsync(name);
                    console.log(`Process "${name}" stopped successfully.`);
                } catch (err) {
                    console.error("Error stopping process:", err.message);
                }
            }

            next();
            break;

        case "restart":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
            } else {
                try {
                    await pm2RestartAsync(name);
                    console.log(`Process "${name}" restarted successfully.`);
                } catch (err) {
                    console.error("Error restarting process:", err.message);
                }
            }

            next();
            break;

        case "delete":
            if (!hasName) {
                console.error("ERROR: No process name provided.");
            } else {
                try {
                    await pm2DeleteAsync(name);
                    console.log(`Process "${name}" deleted successfully.`);
                } catch (err) {
                    console.error("Error deleting process:", err.message);
                }
            }

            next();
            break;

        case "list":
            let list;

            try {
                list = await pm2ListAsync();
            } catch (err) {
                console.error("Error fetching process list:", err);
            }

            if (typeof list !== "undefined") {
                const procTable = list.map(proc => ({
                    id: proc.pm_id,
                    name: proc.name,
                    status: proc.pm2_env.status
                }));

                console.table(procTable);
            }

            next();
            break;

        case "logs":
            if (!(await streamLogs(name))) {
                next();
            }

            break;

        case "exit":
            if (name !== "logs") {
                await disconnect();

                break;
            }

        case "exitlogs":
            await stopStreaming();

            next();
            break;

        default:
            console.log("Unknown command.", help);

            next();
            break;
    }
}

let logStream = null;

async function streamLogs(name = "all") {
    if (logStream !== null) {
        console.log('Logs are already streaming. Type "exitlogs" to stop them.');
        return false;
    }

    console.log(`Streaming logs for: "${name}"`);

    let bus;

    try {
        bus = await pm2LaunchBusAsync();
    } catch (err) {
        console.error("Error launching PM2 log bus:", err);
        return false;
    }

    logStream = bus;

    bus.on("log:out", data => {
        if (name === "all" || data.process.name === name) {
            process.stdout.write(`[${data.process.name}] ${data.data}`);
        }
    });

    bus.on("log:err", data => {
        if (name === "all" || data.process.name === name) {
            process.stderr.write(`[${data.process.name} ERROR] ${data.data}`);
        }
    });

    return true;
}

async function stopStreaming() {
    if (logStream === null) {
        console.log("No logs are currently being streamed.");
        return;
    }

    await pm2DisconnectBusAsync();
    logStream = null;

    console.log("Stopped streaming logs.");
}

module.exports = { handler, streamLogs, stopStreaming };
