var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
if (width <= 380) {
  document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale=' + Math.min(width / 380, 1));
}

const localStorage = window.localStorage;
function extractRGB(rgbColor) {
  let rgbValues = rgbColor.substring(rgbColor.indexOf("(") + 1, rgbColor.indexOf(")")).split(", ");
  let red = parseInt(rgbValues[0]);
  let green = parseInt(rgbValues[1]);
  let blue = parseInt(rgbValues[2]);

  return {
    r: red,
    g: green,
    b: blue
  };
}

let isColorSelected = false
let hCanvas = document.getElementById("h")
let hCtx = hCanvas.getContext('2d');
hCanvas.width = hCanvas.clientWidth;
hCanvas.height = hCanvas.clientHeight;
hCtx.setTransform(1, 0, 0, 1, 0, 0);
let hueGradient = hCtx.createLinearGradient(0, 0, hCtx.canvas.width, 0);
hueGradient.addColorStop(0, 'rgb(255, 0, 0)');
hueGradient.addColorStop(0.15, 'rgb(255, 0, 255)');
hueGradient.addColorStop(0.33, 'rgb(0, 0, 255)');
hueGradient.addColorStop(0.49, 'rgb(0, 255, 255)');
hueGradient.addColorStop(0.67, 'rgb(0, 255, 0)');
hueGradient.addColorStop(0.84, 'rgb(255, 255, 0)');
hueGradient.addColorStop(1, 'rgb(255, 0, 0)');
hCtx.fillStyle = hueGradient;
hCtx.fillRect(0, 0, hCtx.canvas.width, hCtx.canvas.height);
const HSLToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};
function RGBToHSL(rgb) {
  const match = rgb.match(/\d+/g);
  r = match[0]
  g = match[1]
  b = match[2]
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;
  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0)
    h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l]
}

let sbCanvas = document.getElementById("sb")
let sbCtx = sbCanvas.getContext('2d');
sbCanvas.width = sbCanvas.clientWidth;
sbCanvas.height = sbCanvas.clientHeight;
sbCtx.setTransform(1, 0, 0, 1, 0, 0);
function sbCanvasChange(huergbselected, grayscale) {
  const hue = RGBToHSL(huergbselected)[0]
  const prevColor = RGBToHSL(document.getElementById('colorviewer').style.backgroundColor || '154,154,154')
  const nowColor = HSLToRGB(hue, prevColor[1], prevColor[2])
  document.getElementById('colorviewer').style.backgroundColor = `rgb(${nowColor[0]},${nowColor[1]},${nowColor[2]})`
  console.log(grayscale)
  for (row = 0; row < sbCanvas.height; row++) {
    var grad = sbCtx.createLinearGradient(0, 0, sbCanvas.width, 0);
    if (grayscale)
      grad.addColorStop(1, 'hsl(' + hue + ', 0%, ' + (sbCanvas.height - row) / sbCanvas.height * 100 + '%)');
    else
      grad.addColorStop(1, 'hsl(' + hue + ', 100%, ' + (sbCanvas.height - row) / sbCanvas.height * 100 + '%)');
    grad.addColorStop(0, 'hsl(' + hue + ', 0%, ' + (sbCanvas.height - row) / sbCanvas.height * 100 + '%)');
    sbCtx.fillStyle = grad;
    sbCtx.fillRect(0, row, sbCanvas.width, 1);
  }
}
let mouseDown = false
let clickedInH = false
let clickedInSb = false
let sbMouseX, sbMouseY, sbIn;
let hMouseX, hMouseY, hIn;
function onMove(event) {
  if (event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel') {
    let touch = event.touches[0] || event.changedTouches[0];
    x = touch.pageX;
    y = touch.pageY;
  } else if (event.type == 'mousedown' || event.type == 'mouseup' || event.type == 'mousemove' || event.type == 'mouseover' || event.type == 'mouseout' || event.type == 'mouseenter' || event.type == 'mouseleave') {
    x = event.pageX;
    y = event.pageY;
  }
  if (isColorSelected) {
    document.getElementById("submit").textContent = "submit"
    document.getElementById("submit").style.backgroundColor = "#F0F0F0"
    document.getElementById("submit").style.color = "#000"
    document.getElementById("submit").style.width = "100px"
  }
  sbMouseX = x - sbCanvas.offsetLeft;
  sbMouseY = y - sbCanvas.offsetTop;
  if (sbMouseX > sbCanvas.offsetWidth || sbMouseX < 0 || sbMouseY > sbCanvas.offsetHeight || sbMouseY < 0) {
    sbIn = false
  }
  else {
    sbIn = true
  }
  hMouseX = x - hCanvas.offsetLeft;
  hMouseY = y - hCanvas.offsetTop;
  if (hMouseX > hCanvas.offsetWidth || hMouseX < 0 || hMouseY > hCanvas.offsetHeight || hMouseY < 0) {
    hIn = false
  }
  else {
    hIn = true
  }

  if (mouseDown) {
    if (clickedInSb) {
      let colorAtMouse = sbCtx.getImageData(sbMouseX, sbMouseY, 1, 1).data;
      let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
      if (color != "rgb(0,0,0)") {
        document.getElementById("colorviewer").style.backgroundColor = color
        isColorSelected = true
        document.getElementById("word").style.color = color
      }
    }
    if (clickedInH) {
      let colorAtMouse = hCtx.getImageData(hMouseX, 1, 1, 1).data;
      let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
      if (color != "rgb(0,0,0)")
        sbCanvasChange(color, false)
    }
  }
}
document.addEventListener('mousemove', onMove);
document.addEventListener('touchmove', onMove);

function onUp(event) {
  if (isColorSelected) {
    document.getElementById("submit").style.backgroundColor = "#F0F0F0"
    document.getElementById("submit").style.color = "#000"
    document.getElementById("submit").textContent = "submit"
  }
  mouseDown = false
  clickedInH = false
  clickedInSb = false
}

document.addEventListener('mouseup', onUp);
document.addEventListener('touchend', onUp);

function onDown(event) {
  onMove(event)
  if (hIn) {
    clickedInH = true
  }
  else {
    clickedInH = false
  }
  if (sbIn) {
    clickedInSb = true
  }
  else {
    clickedInSb = false
  }
  if (clickedInSb) {
    let colorAtMouse = sbCtx.getImageData(sbMouseX, sbMouseY, 1, 1).data;
    let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
    if (color != "rgb(0,0,0)") {
      document.getElementById("colorviewer").style.backgroundColor = color
      isColorSelected = true
      document.getElementById("word").style.color = color
    }
  }
  if (clickedInH) {
    let colorAtMouse = hCtx.getImageData(hMouseX, 1, 1, 1).data;
    let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
    if (color != "rgb(0,0,0)")
      sbCanvasChange(color, false)
  }
  mouseDown = true
}
document.addEventListener('mousedown', onDown);
document.addEventListener('touchstart', onDown);

function shuffle(obj1, obj2) {
  let index = obj1.length;
  let rnd, tmp1, tmp2;

  while (index) {
    rnd = Math.floor(Math.random() * index);
    index -= 1;
    tmp1 = obj1[index];
    tmp2 = obj2[index];
    obj1[index] = obj1[rnd];
    obj2[index] = obj2[rnd];
    obj1[rnd] = tmp1;
    obj2[rnd] = tmp2;
  }
}

//단어배정
let wordsWithColorsCount, wordnum
(async () => {
  wordsWithColorsCount = JSON.parse(await (await fetch('/api/getwordswithcolorscount')).json())
  if (Math.random() * 100 > 50)
    wordsWithColorsCount.sort((x, y) => x[2] - y[2])
  else
    wordsWithColorsCount.sort(() => Math.random() - 0.5)
  wordnum = 0
  // while (localStorage.getItem(words[wordnum]) !== null) {
  //   wordnum++;
  //   if (wordnum >= words.length) {
  //     location.href = '/results'
  //     throw "every colorword has been submitted"
  //   }
  // }
  while (localStorage.getItem(wordsWithColorsCount[wordnum][0]) !== null) {
    wordnum++;
    if (wordnum >= wordsWithColorsCount.length) {
      location.href = '/results'
      throw "every colorword has been submitted"
    }
  }
  document.getElementById('word').textContent = wordsWithColorsCount[wordnum][0] + '?'
  document.getElementById('meaning').textContent = ' - ' + wordsWithColorsCount[wordnum][1]
  document.title = 'Colorword - What color do you see in a word... ' + wordsWithColorsCount[wordnum][0] + '?'
})()

//버튼 눌리면 전송+결과 리다이렉트
let button = document.getElementById("submit");

// Attach a click event listener to the button
button.addEventListener("touchend", onSend);
button.addEventListener("click", onSend);

let sending = false
function onSend() {
  if (button.textContent !== "submit") {
    return
  }
  if (sending) {
    return
  }
  sending = true
  const { r, g, b } = extractRGB(document.getElementById("colorviewer").style.backgroundColor)
  fetch('/api/submitcolor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([wordsWithColorsCount[wordnum][0], { r, g, b }]),
  })
    .then((response) => {
      if (response.ok) {
        // RGB data submitted successfully
        return response.json();
      } else {
        throw new Error('Error submitting RGB data');
      }
    })
    .then((data) => {
      console.log(data.message);
      localStorage.setItem(document.getElementById('word').textContent.slice(0, -1), JSON.stringify([r, g, b]));
      location.href = '/result' + '?word=' + document.getElementById('word').textContent.slice(0, -1) + '&meaning=' + document.getElementById('meaning').textContent + '&r=' + r + '&g=' + g + '&b=' + b
      sending = false
    })
    .catch((error) => {
      console.log('An error occurred:', error);
      sending = false
    });
}