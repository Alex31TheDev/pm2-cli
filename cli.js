"use strict";

const readline = require("readline");

const { pm2ConnectAsync, pm2DisconnectAsync } = require("./pm2async.js");

const intro = 'PM2 Interactive Shell. Enter commands (e.g., start, stop, restart, delete). Type "exit" to quit.',
    goodbye = "Disconnected from PM2. Goodbye!";

const help = "Available commands: start <script/name>, stop <name>, restart <name>, delete <name>, list, exit";

const prompt = "PM2>";

function startCli(handler) {
    global_handler = handler;
    const rl = createInterface();

    console.log(intro);
    rl.prompt();

    global_rl = rl;
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

async function connect() {
    try {
        await pm2ConnectAsync();
    } catch (err) {
        console.error("Error connecting to PM2:", err);
        process.exit(1);
    }
}

async function disconnect() {
    await pm2DisconnectAsync();

    console.log(goodbye);
    process.exit(0);
}

let global_handler, global_rl;

function next() {
    return global_rl.prompt();
}

module.exports = {
    connect,
    disconnect,

    startCli,

    help,
    global_rl,
    next
};
