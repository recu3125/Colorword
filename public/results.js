const localStorage = window.localStorage;
const container = document.getElementById('container');
let allAnswered = true
fetch('/resources/wordData.json')
  .then(async (wordData) => {
    wordData = await wordData.json();

    for (let i = 0; i < wordData.words.length; i++) {
      if (localStorage.getItem(wordData.words[i]) !== null) {
        const item = JSON.parse(localStorage.getItem(wordData.words[i]));
        const wordbtn = document.createElement("button");
        wordbtn.textContent = wordData.words[i];

        (function (index) {
          wordbtn.onclick = function () {
            var url = '/result' +
              '?word=' + encodeURIComponent(wordData.words[index]) +
              '&meaning=' + encodeURIComponent(wordData.meanings[index]) +
              '&r=' + encodeURIComponent(item[0]) +
              '&g=' + encodeURIComponent(item[1]) +
              '&b=' + encodeURIComponent(item[2]);

            location.href = url;
          };
        })(i);

        container.appendChild(wordbtn);
      }
      else {
        allAnswered = false
      }
    }
    if (allAnswered) {
      const allAnsParagraph = document.createElement('p')
      allAnsParagraph.className = 'title'
      allAnsParagraph.innerHTML = "Congratulations! You've provided answers for all the words on my website!<br>Now you can click <a href='https://forms.gle/Wg7Y2Wq6UdWueqRF8' target='_blank'>here</a> to suggest a new word to be added in Colorword!<br>Thank you for your contribution!"
      document.getElementById('top').appendChild(allAnsParagraph)
      flyconfetti()
    }
  });

function flyconfetti() {
  var end = Date.now() + (7 * 1000);
  var colors = ["#6127f8", "#24e071", "#84a1b2", "#95cffe", "#9e1ada", "#d78b76", "#aed26e", "#3917f7", "#90c35d", "#42da06", "#694fc6", "#d3b272", "#fee22e", "#12ba9b", "#1bf1b4", "#6af91b", "#45004b", "#78db95", "#b9db2c", "#5b1621", "#d9992e", "#e2fb34", "#adaf9b", "#537f44", "#ef7278", "#230ee2", "#26cbcf",];

  (function frame() {
    var color = [colors[Math.floor(Math.random() * colors.length)], colors[Math.floor(Math.random() * colors.length)]]
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: color
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: color
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}