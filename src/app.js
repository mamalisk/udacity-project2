const express = require("express");
const bodyParser = require("body-parser");
const Routes = require("./routes/Routes");

/**
 *
 * Bootstraps the Application
 * @class App
 */
class App {

    constructor() {
        this.app = express();
        this.conf();
    }

    conf() {
        this.app.use(bodyParser.json());
        this.app.set("port", process.env.PORT || 8000);
        this.app.use(bodyParser.urlencoded({ extended: true }));
        Routes.for(this.app);
    }
}

module.exports = new App().app;