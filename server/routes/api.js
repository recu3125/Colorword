const express = require('express');
const router = express.Router();
const { addColor, getColors, getWordsWithColorsCount } = require('../db')
router.use(express.json());

// Handle POST request to submit RGB data
router.post('/submitcolor', async (req, res) => {
  console.log(req.body)
  const { r, g, b } = req.body[1]
  const word = req.body[0]

  await addColor(word, r, g, b)

  res.json({ message: 'RGB data submitted successfully!' });
});

router.get('/colors', async (req, res) => {
  const word = req.query.word;
  try {
    const colors = await getColors(word);
    const payload = Buffer.alloc(colors.length * 3);
    for (let i = 0; i < colors.length; i += 1) {
      const offset = i * 3;
      payload[offset] = colors[i].r;
      payload[offset + 1] = colors[i].g;
      payload[offset + 2] = colors[i].b;
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.send(payload);
  } catch (error) {
    if (error && error.message === 'Word not found') {
      res.status(404).json({ message: 'Word not found' });
      return;
    }
    res.status(500).json({ message: 'Failed to load colors' });
  }
});

router.get('/getwordswithcolorscount', async (req, res) => {
  res.json(await getWordsWithColorsCount())
});

module.exports = router;
