const scrollingText = document.getElementById('scrollingText');
const lines = scrollingText.getElementsByTagName('br').length + 1;

let keyframes = '';
let pausePercentage = 0;

for (let i = 0; i < lines - 1; i++) {
  keyframes += `${pausePercentage}% { transform: translateY(-${i * 100 * (lines - 1) / (lines - 1) / lines}%); } `;
  pausePercentage += 100 / (lines - 1);
}

const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes scroll {
    ${keyframes}
    100% { transform: translateY(-${100 * (lines - 1) / (lines)}%); ); }
  }
`;

document.head.appendChild(styleSheet);

