module.exports = {
    apps: [
        {
            name: "app1",
            script: "index.js",
            cwd: "~/app1",
            merge_logs: true,
            out_file: "/dev/stdout",
            error_file: "/dev/stderr"
        },
        {
            name: "app2",
            script: "index.js",
            cwd: "~/app2",
            merge_logs: true,
            out_file: "/dev/stdout",
            error_file: "/dev/stderr"
        }
    ]
};
