const express = require("express");
const path = require("path");
const app = express();
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/resources', express.static(path.join(__dirname, '..', 'resources')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'home.html'));
});

app.get('/question', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'question.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'result.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'results.html'));
});

app.listen(80, () => {
  console.log("Server is listening on port 80")
});