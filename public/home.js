var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
if (width <= 380) {
  document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale=' + Math.min(width / 380, 1));
}

fetch('/resources/wordData.json')
  .then(async (wordData) => {
    const scrollingText = document.getElementById('scrollingText');
    wordData = await wordData.json();
    words = wordData.words
    text = ''
    for (i = 0; i < words.length; i++) {
      text += words[i] + '?' + '<br>'
    }
    text += words[0] + '?'
    console.log(text)
    scrollingText.innerHTML = text
    const lines = scrollingText.getElementsByTagName('br').length + 1;

    let keyframes = '';
    let pausePercentage = 0;

    for (let i = 0; i < lines - 1; i++) {
      keyframes += `${pausePercentage}% { transform: translateY(-${i * 100 * (lines - 1) / (lines - 1) / lines}%); } `;
      pausePercentage += 100 / (lines - 1);
    }

    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `@keyframes scroll {${keyframes}100% { transform: translateY(-${100 * (lines - 1) / (lines)}%); ); }}`;

    document.head.appendChild(styleSheet);
  })
function scrollinfo() {
  const infoSection = document.getElementById('info-section');
  const infoSectionHeight = infoSection.clientHeight;
  const startPosition = window.scrollY;
  const targetPosition = infoSection.offsetTop - (window.innerHeight - infoSectionHeight);
  const distance = targetPosition - startPosition;
  const duration = 1000; // Adjust this value to control the scroll speed (in milliseconds)
  let startTime = null;

  function scrollStep(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const easeProgress = Math.min(progress / duration, 1);
    const easing = easeInOutQuad(easeProgress);
    window.scrollTo(0, startPosition + distance * easing);

    if (progress < duration) {
      requestAnimationFrame(scrollStep);
    }
  }

  // Easing function
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(scrollStep);
}
