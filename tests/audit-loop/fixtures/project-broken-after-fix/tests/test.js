const config = require("../src/index");
if (!config.DEBUG_LOG) {
  console.error("DEBUG_LOG should be true");
  process.exit(1);
}
console.log("all tests pass");
