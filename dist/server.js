"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var port = Number(process.env.PORT) || 7000;
app_1.default.server.listen(port, function () {
    return console.log("server is listening on " + port);
});
//# sourceMappingURL=server.js.map