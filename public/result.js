var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
if (width <= 470) {
  document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale=' + Math.min(width / 470, 1));
}

class RGBColor {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }
}

async function setvotescount(word) {
  let wordscount = JSON.parse(await (await fetch('/api/getwordswithcolorscount')).json())
  wordscount.map((x) => {
    if (x[0] == word) {
      document.getElementById('votecount').innerText = (x[2] + ' votes have been collected.')
    }
  })
}


function parseurl() {
  let currentURL = window.location.href;
  let searchParams = new URLSearchParams(window.location.search);
  let word = searchParams.get("word");
  let meaning = searchParams.get("meaning");
  let r = searchParams.get("r");
  let g = searchParams.get("g");
  let b = searchParams.get("b");
  return { word, meaning, r, g, b }
}

var colors = false
async function identifyColor(RGB) {
  if (colors === false) {
    colors = await (await fetch('/resources/colors.json')).json()
  }
  let closestColor = null;
  let minDistance = Infinity;
  for (let i = 0; i < colors.length; i++) {
    let color = colors[i]
    const distance = colordist(RGB, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  }
  return closestColor || 'unknown';
}

async function getRGBs() {
  const { word, meaning, r, g, b } = parseurl()
  const response = await fetch('/api/colors?word=' + word)
  const colorsData = JSON.parse(await response.json());
  const colors = colorsData.map(colorData => {
    const { r, g, b } = colorData;
    return new RGBColor(parseInt(r), parseInt(g), parseInt(b), 255);
  });
  return colors
}

const imagewh = 100
async function loaded() {
  const { word, meaning, r, g, b } = parseurl()
  document.title = 'Colorword - ' + word
  let selectedRGB = new RGBColor(r, g, b, 255)
  let RGBs = await getRGBs()
  let LABs = await RGBs.map(x => RGBtoLAB(x))
  let selectedLAB = RGBtoLAB(selectedRGB)
  let similarcount = nearcount(LABs, selectedLAB[0], selectedLAB[1], selectedLAB[2], 25) //비슷한 선택을 한 사람 수
  let votecount = LABs.length
  RGBs = await matchcolorscount(RGBs, imagewh * imagewh)

  //mostcolor
  let mostcolor1 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  let mostcolor2, mostcolor3
  const delradiusarray = [30, 15, 10, 5, 2, 0]
  if (LABs.length >= 3) {
    let delradiusindex = 0
    while (neardelete(LABs, RGBtoLAB(mostcolor1), delradiusarray[delradiusindex]).length < 2) {
      delradiusindex += 1
    }
    LABs = neardelete(LABs, RGBtoLAB(mostcolor1), delradiusarray[delradiusindex])
    mostcolor2 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  }
  else {
    mostcolor2 = mostcolor1
  }
  if (LABs.length >= 2) {
    let delradiusindex = 0
    while (neardelete(LABs, RGBtoLAB(mostcolor2), delradiusarray[delradiusindex]).length < 1) {
      delradiusindex += 1
    }
    LABs = neardelete(LABs, RGBtoLAB(mostcolor2), delradiusarray[delradiusindex])
    mostcolor3 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  }
  else {
    mostcolor3 = mostcolor2
  }
  document.getElementById("sel0").style.backgroundColor = `rgb(${selectedRGB.r}, ${selectedRGB.g}, ${selectedRGB.b})`
  document.getElementById("sel1").style.backgroundColor = `rgb(${mostcolor1.r}, ${mostcolor1.g}, ${mostcolor1.b})`
  document.getElementById("sel2").style.backgroundColor = `rgb(${mostcolor2.r}, ${mostcolor2.g}, ${mostcolor2.b})`
  document.getElementById("sel3").style.backgroundColor = `rgb(${mostcolor3.r}, ${mostcolor3.g}, ${mostcolor3.b})`

  document.getElementById("name0").textContent = await identifyColor(selectedRGB)
  document.getElementById("similarcount").textContent =`${similarcount} of ${votecount} agree with you!`
  document.getElementById("name1").textContent = await identifyColor(mostcolor1)
  document.getElementById("name2").textContent = await identifyColor(mostcolor2)
  document.getElementById("name3").textContent = await identifyColor(mostcolor3)

  document.getElementById("word").textContent = word
  document.getElementById("meaning").textContent = meaning

  //setvotescount(word)
  makeimage(RGBs)
}

function nearestcolor(RGBs, RGB) {
  let min = Infinity
  let minval = false
  for (let i = 0; i < RGBs.length; i++) {
    let dist = colordist(RGBs[i], RGB)
    if (dist < min) {
      minval = RGBs[i]
      min = dist
    }
  }
  return minval
}

function makeimage(RGBs) {
  let canvas = document.getElementById('colorsort')
  let ctx = canvas.getContext('2d');

  //pixels init
  let pixels = []
  for (let i = 0; i < imagewh; i++) {
    let row = []
    for (let j = 0; j < imagewh; j++) {
      row.push(false)
    }
    pixels.push(row)
  }

  let LABs = RGBs.map(RGB => RGBtoLAB(RGB))
  let mainRGB = LABtoRGB(mostcolor(LABs))
  pixels[imagewh / 2][imagewh / 2] = mainRGB
  RGBs.splice(0, 1)
  LABs.splice(0, 1)
  let limitdist = 10
  step()
  function step() {
    let prepixels = structuredClone(pixels);
    for (let i = 0; i < imagewh; i++) {
      for (let j = 0; j < imagewh; j++) {
        if (prepixels[i][j] !== false) continue;
        let [aroundRGB, aroundcount] = aroundcolor(pixels, prepixels, i, j)
        let possibilities = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3]
        if (aroundcount <= possibilities[Math.floor(Math.random() * 10)]) {
          continue;
        }
        let idealRGB = biasavgcolor(mainRGB, aroundRGB, 50)
        let idealLAB = RGBtoLAB(idealRGB)
        let mindist = 10000000
        let minloc = 0
        for (let k = 0, len = LABs.length; k < len; k++) {
          let distEach = colordistlab(LABs[k], idealLAB)
          if (distEach < mindist) {
            mindist = distEach
            minloc = k
          }
        }
        let aroundLAB = RGBtoLAB(aroundRGB)
        if (aroundcount <= Math.random() * 6 + 2 && colordistlab(LABs[minloc], aroundLAB) > limitdist) {
          limitdist += 5
          continue
        }
        else { limitdist -= 5 }
        pixels[i][j] = RGBs[minloc]
        RGBs.splice(minloc, 1)
        LABs.splice(minloc, 1)
      }
    }
    if (pixels[imagewh / 2 + 1][imagewh / 2] != false && pixels[imagewh / 2 - 1][imagewh / 2] != false && pixels[imagewh / 2][imagewh / 2 + 1] != false && pixels[imagewh / 2][imagewh / 2 - 1] != false) pixels[imagewh / 2][imagewh / 2] = avgcolor([pixels[imagewh / 2][imagewh / 2 + 1], pixels[imagewh / 2 + 1][imagewh / 2], pixels[imagewh / 2][imagewh / 2 - 1], pixels[imagewh / 2 - 1][imagewh / 2]])
    viewimage(pixels, ctx)
    if (RGBs.length > 0) {
      setTimeout(() => {
        step()
      }, 0);
    }
  }

}

function viewimage(pixels, ctx) {
  let img = ctx.createImageData(imagewh, imagewh);
  //pixels to img
  for (let i = 0; i < imagewh; i++) {
    for (let j = 0; j < imagewh; j++) {
      {
        img.data[4 * (i * imagewh + j)] = pixels[i][j].r
        img.data[4 * (i * imagewh + j) + 1] = pixels[i][j].g
        img.data[4 * (i * imagewh + j) + 2] = pixels[i][j].b
        img.data[4 * (i * imagewh + j) + 3] = pixels[i][j].a
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

async function matchcolorscount(RGBs, targetnum) {
  let matchedRGBs = structuredClone(RGBs);
  while (matchedRGBs.length > targetnum) {
    matchedRGBs.splice(Math.floor(Math.random() * (matchedRGBs.length)), 1)
  }
  while (matchedRGBs.length < targetnum) {
    matchedRGBs.push(RGBnoise(RGBs[Math.floor(Math.random() * (RGBs.length))]))
  }
  return matchedRGBs
}

function RGBnoise(RGB) {
  let r = RGB.r + Math.floor(Math.random() * 30 - 15)
  let g = RGB.g + Math.floor(Math.random() * 30 - 15)
  let b = RGB.b + Math.floor(Math.random() * 30 - 15)
  r = Math.abs(r)
  g = Math.abs(g)
  b = Math.abs(b)
  r = 255 - Math.abs(r - 255)
  g = 255 - Math.abs(g - 255)
  b = 255 - Math.abs(b - 255)
  return new RGBColor(r, g, b, RGB.a)
}

function colordist(RGB1, RGB2) {
  let LAB1 = RGBtoLAB(RGB1)
  let LAB2 = RGBtoLAB(RGB2)
  return Math.pow(LAB1[0] - LAB2[0], 2) + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}
function colordistlab(LAB1, LAB2) {
  return Math.pow(LAB1[0] - LAB2[0], 2) + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}

function aroundcolor(pixels, prepixels, i, j) {
  let RGBlist = []
  let aroundlist = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  for (let k = 0; k < aroundlist.length; k++) {
    let x = i + aroundlist[k][0]
    let y = j + aroundlist[k][1]
    if (imagewh > x && imagewh > y && x >= 0 && y >= 0 && prepixels[x][y] != false) {
      RGBlist.push(pixels[x][y])
    }
  }
  return [avgcolor(RGBlist), RGBlist.length]
}

function avgcolor(RGBlist) {
  let result = new RGBColor(0, 0, 0, 255)
  for (let i = 0; i < RGBlist.length; i++) {
    let RGB = RGBlist[i]
    result.r += RGB.r
    result.g += RGB.g
    result.b += RGB.b
  }
  result.r = Math.round(result.r / RGBlist.length)
  result.g = Math.round(result.g / RGBlist.length)
  result.b = Math.round(result.b / RGBlist.length)
  return result
}

function biasavgcolor(RGB1, RGB2, biastoone) {
  let result = new RGBColor(0, 0, 0, 255)
  result.r += RGB1.r * biastoone
  result.g += RGB1.g * biastoone
  result.b += RGB1.b * biastoone
  result.r += RGB2.r
  result.g += RGB2.g
  result.b += RGB2.b
  result.r = Math.round(result.r / (biastoone + 1))
  result.g = Math.round(result.g / (biastoone + 1))
  result.b = Math.round(result.b / (biastoone + 1))
  return result
}

function testcolors(RGBscount) {

  let bias = new RGBColor(0, 100, 155, 255)
  let bstrength = 1
  let RGBslist = []
  for (let i = 0; i < RGBscount; i++) {
    let red = Math.round(Math.random() * 255)
    let green = Math.round(Math.random() * 255)
    let blue = Math.round(Math.random() * 255)
    let alpha = 255
    //bias
    if (bstrength >= 1) {
      red = Math.round(red >= bias.r ? (-Math.pow((256 - red) * Math.pow(256 - bias.r, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(red * Math.pow(bias.r, bstrength), 1 / (bstrength + 1)))
      green = Math.round(green >= bias.g ? (-Math.pow((256 - green) * Math.pow(256 - bias.g, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(green * Math.pow(bias.g, bstrength), 1 / (bstrength + 1)))
      blue = Math.round(blue >= bias.b ? (-Math.pow((256 - blue) * Math.pow(256 - bias.b, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(blue * Math.pow(bias.b, bstrength), 1 / (bstrength + 1)))
    }
    RGBslist.push(new RGBColor(red, green, blue, alpha))
  }
  return RGBslist
}


function mostcolor(LABs) {
  maxpoint = [50, 0, 0]
  maxpoint = approach(LABs, maxpoint, 32, 3)
  maxpoint = approach(LABs, maxpoint, 16, 2)
  maxpoint = approach(LABs, maxpoint, 8, 1)
  maxpoint = approach(LABs, maxpoint, 4, 1)
  maxpoint = approach(LABs, maxpoint, 2, 1)
  maxpoint = approach(LABs, maxpoint, 1, 1)
  return maxpoint
}

function neardelete(LABs, xyz, radius) {
  let x = xyz[0], y = xyz[1], z = xyz[2];
  let filteredLABs = [];

  for (let i = 0; i < LABs.length; i++) {
    let dist = colordistlab(LABs[i], [x, y, z]);
    if (dist > (radius * radius)) {
      filteredLABs.push(LABs[i]);
    }
  }

  return filteredLABs;
}

function approach(LABs, xyz, step, stepcount) {
  let offsets = [];
  for (let i = -stepcount; i <= stepcount; i++) {
    for (let j = -stepcount; j <= stepcount; j++) {
      for (let k = -stepcount; k <= stepcount; k++) {
        offsets.push([i, j, k]);
      }
    }
  }
  let max = 0
  resultxyz = structuredClone(xyz);
  for (let i = 0; i < offsets.length; i++) {
    let x = xyz[0] + offsets[i][0] * step
    let y = xyz[1] + offsets[i][1] * step
    let z = xyz[2] + offsets[i][2] * step
    //let nearcountres = nearcount(LABs, x, y, z, radius)
    let nearcountres = LABs.reduce((accumulator, current) => accumulator + 1 / Math.max(colordistlab(current, [x, y, z]), 50), 0);
    if (nearcountres > max) {
      max = nearcountres
      resultxyz = [x, y, z]
    }
  }
  return resultxyz
}

function nearcount(LABs, x, y, z, radius) {
  count = 0
  for (let i = 0; i < LABs.length; i++) {
    let dist = colordistlab(LABs[i], [x, y, z])
    if (dist <= (radius * radius)) {
      count += 1
    }
  }
  return count
}

function LABtoRGB(LAB) {
  let L = LAB[0]
  let A = LAB[1]
  let B = LAB[2]

  let y = (L + 16) / 116
  let x = A / 500 + y
  let z = y - B / 200

  if (Math.pow(y, 3) > 0.008856) {
    y = Math.pow(y, 3)
  } else {
    y = (y - 16 / 116) / 7.787
  }

  if (Math.pow(x, 3) > 0.008856) {
    x = Math.pow(x, 3)
  } else {
    x = (x - 16 / 116) / 7.787
  }

  if (Math.pow(z, 3) > 0.008856) {
    z = Math.pow(z, 3)
  } else {
    z = (z - 16 / 116) / 7.787
  }

  let xPrime = x * 0.95047
  let yPrime = y * 1.00000
  let zPrime = z * 1.08883

  let r = xPrime * 3.2406 + yPrime * -1.5372 + zPrime * -0.4986
  let g = xPrime * -0.9689 + yPrime * 1.8758 + zPrime * 0.0415
  let b = xPrime * 0.0557 + yPrime * -0.2040 + zPrime * 1.0570

  if (r > 0.0031308) {
    r = 1.055 * (Math.pow(r, (1 / 2.4))) - 0.055
  } else {
    r *= 12.92
  }

  if (g > 0.0031308) {
    g = 1.055 * (Math.pow(g, (1 / 2.4))) - 0.055
  } else {
    g *= 12.92
  }

  if (b > 0.0031308) {
    b = 1.055 * (Math.pow(b, (1 / 2.4))) - 0.055
  } else {
    b *= 12.92
  }

  let rFinal = Math.min(255, Math.max(Math.round(r * 255), 0));
  let gFinal = Math.min(255, Math.max(Math.round(g * 255), 0));
  let bFinal = Math.min(255, Math.max(Math.round(b * 255), 0));

  return new RGBColor(rFinal, gFinal, bFinal, 255);
}

// CIELAB
let cache = new Array(256)
for (let i = 0; i < 256; i++) {
  cache[i] = new Array(256)
  for (let j = 0; j < 256; j++) {
    cache[i][j] = new Array(256).fill(0)
  }
}
function RGBtoLAB(RGB) {
  if (cache[RGB.r][RGB.g][RGB.b] !== 0) {
    return cache[RGB.r][RGB.g][RGB.b]
  }

  const rgbKey = `${RGB.r}-${RGB.g}-${RGB.b}`;

  const r = RGB.r / 255;
  const g = RGB.g / 255;
  const b = RGB.b / 255;

  const linearizeColor = (color) => {
    if (color > 0.04045) {
      return Math.pow((color + 0.055) / 1.055, 2.4);
    }
    return color / 12.92;
  };

  const xyzTransform = (color) => {
    if (color > 0.008856) {
      return Math.pow(color, 1 / 3);
    }
    return (903.3 * color + 16) / 116;
  };

  const rLinear = linearizeColor(r);
  const gLinear = linearizeColor(g);
  const bLinear = linearizeColor(b);

  const x = (0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear) / 0.95047;
  const y = (0.2126729 * rLinear + 0.7151522 * gLinear + 0.072175 * bLinear) / 1.00000;
  const z = (0.0193339 * rLinear + 0.119192 * gLinear + 0.9503041 * bLinear) / 1.08883;

  const L = (116 * xyzTransform(y)) - 16;
  const A = 500 * (xyzTransform(x) - xyzTransform(y));
  const B = 200 * (xyzTransform(y) - xyzTransform(z));

  cache[RGB.r][RGB.g][RGB.b] = [L, A, B]
  return [L, A, B];
}
