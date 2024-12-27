module.exports = {
    daemon: false,
    apps: [
        {
            name: "app1",
            script: "index.js",
            cwd: "~/app1",
            log_file: "/dev/null"
        },
        {
            name: "app2",
            script: "index.js",
            cwd: "~/app2",
            log_file: "/dev/null"
        }
    ]
};
