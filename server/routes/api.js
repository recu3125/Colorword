const express = require('express');
const router = express.Router();
const { addColor, getColors, getWordsWithColorsCount } = require('../db')
router.use(express.json());

// Handle POST request to submit RGB data
router.post('/submitcolor', (req, res) => {
  console.log(req.body)
  const { r, g, b } = req.body[1]
  const word = req.body[0]

  addColor(word, r, g, b)

  res.json({ message: 'RGB data submitted successfully!' });
});

router.get('/colors', (req, res) => {
  const word = req.query.word;
  getColors(word).then(colors => {
    res.json(JSON.stringify(colors));
  })
});

router.get('/getwordswithcolorscount', async (req, res) => {
  res.json(JSON.stringify(await getWordsWithColorsCount()))
});

module.exports = router;
