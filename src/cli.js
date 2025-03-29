"use strict";

const readline = require("readline");

const { pm2ConnectAsync, pm2DisconnectAsync } = require("./pm2async.js");

const intro = 'PM2 Interactive Shell. Enter commands (e.g., start, stop, restart, delete). Type "exit" to quit.',
    goodbye = "Disconnected from PM2. Goodbye!";

const help =
    "Available commands: start <script/name>, stop <name>, restart <name>, delete <name>, logs <name>, exitlogs, list, exit";

const prompt = "PM2>";

let global_config = {},
    cli_state = {
        connected: false
    };

async function connect(config) {
    if (cli_state.connected) {
        return;
    }

    Object.assign(global_config, config);

    const args = [];

    if (config.daemon === false) {
        args.push(true);
    }

    try {
        await pm2ConnectAsync(...args);
        cli_state.connected = true;
    } catch (err) {
        console.error("Error connecting to PM2:", err);
        process.exit(1);
    }
}

async function disconnect() {
    if (!cli_state.connected) {
        return;
    }

    try {
        await pm2DisconnectAsync();
        cli_state.connected = false;
    } catch (err) {
        console.error("Error disconnecting from PM2:", err);
        process.exit(1);
    }

    global_rl.close();
    global_rl = null;

    console.log(goodbye);
    process.exit(0);
}

let global_rl = null;

function startCli(handler) {
    const rl = createInterface(handler);
    console.log(intro);

    global_rl = rl;
    next();
}

function createInterface(handler) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: prompt + " "
    });

    rl.on("line", handler);
    rl.on("close", disconnect);

    return rl;
}

function next() {
    return global_rl.prompt();
}

module.exports = {
    global_config,
    cli_state,

    connect,
    disconnect,

    startCli,

    help,
    next
};
