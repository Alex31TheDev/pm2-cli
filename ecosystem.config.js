module.exports = {
    daemon: false,
    apps: [
        {
            name: "app1",
            script: "index.js",
            cwd: "~/app1"
        },
        {
            name: "app2",
            script: "index.js",
            cwd: "~/app2"
        }
    ]
};
