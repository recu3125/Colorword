const express = require("express");
const path = require("path");
const app = express();
const apiRoutes = require('./routes/api');
const port = 8081

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

app.listen(port, () => {
  console.log("Server is listening on port "+port)
});