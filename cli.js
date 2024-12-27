"use strict";

const readline = require("readline");

const { pm2ConnectAsync, pm2DisconnectAsync } = require("./pm2async.js");

const config = require("./ecosystem.config.js");

const intro = 'PM2 Interactive Shell. Enter commands (e.g., start, stop, restart, delete). Type "exit" to quit.',
    goodbye = "Disconnected from PM2. Goodbye!";

const help =
    "Available commands: start <script/name>, stop <name>, restart <name>, delete <name>, logs <name>, exitlogs, list, exit";

const prompt = "PM2>";

function startCli(handler) {
    global_handler = handler;
    const rl = createInterface();

    console.log(intro);

    global_rl = rl;
    next();
}

function createInterface() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: prompt + " "
    });

    rl.on("close", disconnect);
    rl.on("line", global_handler);

    return rl;
}

let connected;

async function connect() {
    if (connected) {
        return;
    }

    const args = [];

    if (config.daemon === false) {
        args.push(true);
    }

    try {
        await pm2ConnectAsync(...args);
        connected = true;
    } catch (err) {
        console.error("Error connecting to PM2:", err);
        process.exit(1);
    }
}

async function disconnect() {
    if (!connected) {
        return;
    }

    try {
        await pm2DisconnectAsync();
        connected = false;
    } catch (err) {
        console.error("Error disconnecting from PM2:", err);
        process.exit(1);
    }

    console.log(goodbye);
    process.exit(0);
}

let global_handler, global_rl;

function next() {
    return global_rl.prompt();
}

module.exports = {
    connected,
    connect,
    disconnect,

    startCli,

    help,
    global_rl,
    next
};
