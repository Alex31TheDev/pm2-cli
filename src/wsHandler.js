const { pm2StartAsync, pm2StopAsync, pm2RestartAsync, pm2ListAsync } = require("./pm2async.js");

async function commandHandler(command) {
    const { action, name } = command,
        hasName = typeof name === "string" && name.length > 0;

    switch (action) {
        case "start":
            if (!hasName) {
                throw new Error("No process name provided");
            }

            return await pm2StartAsync(name);

        case "stop":
            if (!hasName) {
                throw new Error("No process name provided");
            }

            return await pm2StopAsync(name);

        case "restart":
            if (!hasName) {
                throw new Error("No process name provided");
            }

            return await pm2RestartAsync(name);
        case "list":
            return await pm2ListAsync();

        default:
            throw new Error(`Unknown action: ${command.action}`);
    }
}

async function handler(ws, message) {
    const send = data => {
        ws.send(JSON.stringify(data));
    };

    let command;

    try {
        command = JSON.parse(message);
    } catch (err) {
        send({
            id: null,
            success: false,
            error: "Invalid JSON format"
        });

        return;
    }

    try {
        const result = await commandHandler(command);

        send({
            id: command.id,
            success: true,
            data: result
        });
    } catch (err) {
        send({
            id: command.id,
            success: false,
            error: err.message
        });
    }
}

module.exports = {
    handler: handler
};
