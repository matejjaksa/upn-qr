const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
process.chdir(__dirname);

try {
  require(path.join(__dirname, ".next", "standalone", "server.js"));
} catch (error) {
  console.error("Next standalone server is missing. Run npm run build before starting the app.");
  throw error;
}
