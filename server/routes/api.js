const express = require('express');
const router = express.Router();
router.use(express.json());

// Handle POST request to submit RGB data
router.post('/rgb', (req, res) => {
  const { r, g, b } = req.body;

  // RGB 데이터 저장하기

  // Send a response to the client
  res.json({ message: 'RGB data submitted successfully!' });
});


router.get('/colors', (req, res) => {
  const word = req.body;

  // 데이터베이스에서 word 해당 단어들 불러오기

  // 색깔리스트주기
  res.json({ message: 'RGB data submitted successfully!' });
});

router.get('/word', (req, res) => {
  const answeredwordslist = req.body;

  // 이미 대답한 단어들 제외 랜덤단어 보내주기

  // Send a response to the client
  res.json({ message: 'RGB data submitted successfully!' });
});

module.exports = router;
