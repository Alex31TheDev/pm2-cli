const WebSocket = require("ws");

const { pm2StartAsync, pm2StopAsync, pm2RestartAsync, pm2ListAsync } = require("./pm2async.js");

const host = "localhost";

let global_config = {},
    server_state = {
        started: false
    };

let wsServer = null;

function startServer(config, handler) {
    if (server_state.started) {
        return;
    }

    Object.assign(global_config, config);
    const port = config.websocketPort;

    try {
        wsServer = new WebSocket.Server({ port, host });
    } catch (err) {
        console.error("ERROR: Occured while starting websocket server:");
        console.error(err);

        process.exit(1);
    }

    wsServer.on("connection", ws => {
        ws.on("message", message => handler(ws, message));

        ws.on("error", err => {
            console.error("ERROR: Occured with WebSocket connection:", err);
            console.error(err);
        });

        ws.on("close", () => console.log("WebSocket client disconnected."));
    });

    server_state.started = true;
    console.log(`WebSocket server running at: ws://${host}:${port}`);
}

function stopServer() {
    if (!server_state.started) {
        return;
    }

    return new Promise((resolve, reject) => {
        wsServer.close(() => {
            server_state.started = false;
            wsServer = null;

            console.log("WebSocket server closed.");
            resolve();
        });
    });
}

module.exports = {
    global_config,
    server_state,

    startServer,
    stopServer
};
