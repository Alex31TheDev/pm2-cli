const WebSocket = require("ws");

class PM2Client {
    constructor(url, options = {}) {
        if (typeof url !== "string" || url.length < 1) {
            throw new Error("Invalid websocket URL provided");
        }

        this.url = url;
        this.options = options;

        this.requestTimeout = options.requestTimeout ?? 10000;
        this.reconnectTimeout = options.reconnectTimeout ?? 5000;
        this.autoReconnect = options.autoReconnect ?? true;
        this.maxRetries = options.maxRetries ?? 3;

        this._ws = null;

        this._destroyed = false;
        this._reconnecting = false;
        this._reconnectAttempts = 0;

        this._requestId = 0;
        this._callbacks = new Map();

        this.connect();
    }

    connect() {
        const promise = new Promise((resolve, reject) => {
            if (this._destroyed) {
                return reject(new Error("Client destroyed"));
            } else if (this._ws !== null) this._cleanupSocket();

            this._reconnecting = true;
            this._ws = new WebSocket(this.url);

            const cleanup = (reset = false) => {
                if (reset) this._reconnectAttempts = 0;
                this._reconnecting = false;
            };

            this._ws.on("open", () => {
                cleanup(true);
                resolve();
            });

            this._ws.on("close", () => this._handleClose());
            this._ws.on("message", raw => this._handleMessage(raw));

            this._ws.on("error", err => {
                cleanup(false);
                this._cleanupSocket();

                if (this.autoReconnect && !this._destroyed) {
                    this._scheduleReconnect();
                }

                reject(err);
            });
        });

        this._ready = promise;
        return promise;
    }

    async sendCommand(action, name) {
        if (this._destroyed) {
            throw new Error("Client destroyed");
        }

        await this._ready;

        if (this._destroyed) {
            throw new Error("Client destroyed");
        }

        const command = this._createCommand(action, name);
        return this._sendWithRetry(command, 0);
    }

    start(name) {
        return this.sendCommand("start", name);
    }

    stop(name) {
        return this.sendCommand("stop", name);
    }

    restart(name) {
        return this.sendCommand("restart", name);
    }

    list() {
        return this.sendCommand("list");
    }

    destroy() {
        this._destroyed = true;
        this.autoReconnect = false;

        this._rejectCallbacks();
        this._cleanupSocket();
    }

    disconnect() {
        this.autoReconnect = false;

        this._rejectCallbacks();
        this._cleanupSocket();
    }

    _scheduleReconnect() {
        if (this._reconnecting || this._destroyed) {
            return;
        }

        this._reconnectAttempts++;

        if (this._reconnectAttempts > this.maxRetries) {
            return;
        }

        setTimeout(() => {
            this.connect().catch(err => {
                console.error("Reconnecting failed:", err);
            });
        }, this.reconnectTimeout);
    }

    _createCommand(action, name) {
        const id = this._requestId++;
        return { action, name, id };
    }

    _sendWithRetry(command, retries) {
        return new Promise((resolve, reject) => {
            let cleanup;

            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error("Request timed out"));
            }, this.requestTimeout);

            cleanup = () => {
                clearTimeout(timeout);
                this._callbacks.delete(command.id);
            };

            const wrappedReject = err => {
                cleanup();
                reject(err);
            };

            this._callbacks.set(command.id, this._createCallback(resolve, wrappedReject, cleanup));
            this._attemptSend(command, retries).catch(wrappedReject);
        });
    }

    _createCallback(resolve, reject, cleanup) {
        return res => {
            cleanup();

            if (res.success) {
                resolve(res.data);
            } else {
                const resErr = res.error ?? "Unknown error";
                reject(new Error(resErr));
            }
        };
    }

    _attemptSend(command, retries) {
        return new Promise((resolve, reject) => {
            if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
                const notOpenErr = new Error("Connection not open");
                return this._handleSendError(notOpenErr, command, retries).then(resolve, reject);
            }

            this._ws.send(JSON.stringify(command), err => {
                if (err) {
                    this._handleSendError(err, command, retries).then(resolve, reject);
                } else {
                    resolve();
                }
            });
        });
    }

    async _handleSendError(err, command, retries) {
        if (retries < this.maxRetries && !this._destroyed) {
            if (!this._ws || this._ws.readyState !== WebSocket.OPEN) {
                await this.connect();
            }

            command = this._createCommand(command.action, command.name);
            return this._attemptSend(command, retries + 1);
        }

        throw err;
    }

    _handleMessage(raw) {
        try {
            const res = JSON.parse(raw),
                cb = this._callbacks.get(res.id);

            if (typeof cb === "function") {
                cb(res);
            }
        } catch (err) {
            console.error("Failed to parse message:", err);
        }
    }

    _rejectCallbacks() {
        for (const cb of this._callbacks.values()) {
            cb({
                success: false,
                error: "Connection closed"
            });
        }

        this._callbacks.clear();
    }

    _handleClose() {
        this._rejectCallbacks();
        this._cleanupSocket();

        if (this.autoReconnect && !this._destroyed) {
            this._scheduleReconnect();
        }
    }

    _cleanupSocket() {
        if (this._ws === null) return;

        this._ws.removeAllListeners();

        this._ws.close();
        this._ws = null;
    }
}

module.exports = PM2Client;
