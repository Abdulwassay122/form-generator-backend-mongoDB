const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("✅ API root is working");
});

module.exports = app;
