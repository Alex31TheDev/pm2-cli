const fs = require("fs");
const path = require("path");

const configPath = path.resolve(__dirname, "../config/config.json");

function loadConfig() {
    const raw = fs.readFileSync(configPath);
    return JSON.parse(raw);
}

module.exports = loadConfig;
