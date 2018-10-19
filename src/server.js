const errorHandler = require("errorhandler");
const app = require("./app");

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const port = app.get("port");
app.listen(port, () => {
  console.log(
    `Our Block-🔗  is running at http://localhost:${port} in ${app.get("env")} mode`
  );
  console.log("  Press CTRL-C to stop\n");
});
