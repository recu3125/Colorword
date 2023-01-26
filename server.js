const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.sendFile('home.html', { root: path.join(__dirname, 'public') });
});

app.listen(80, () => {
  console.log("Server is listening on port 80")
});