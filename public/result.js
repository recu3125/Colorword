class RGBColor {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }
}

function parseurl() {
  var currentURL = window.location.href;
  var searchParams = new URLSearchParams(window.location.search);
  var word = searchParams.get("word");
  var meaning = searchParams.get("meaning");
  var r = searchParams.get("r");
  var g = searchParams.get("g");
  var b = searchParams.get("b");
  return { word, meaning, r, g, b }
}

async function identifyColor(RGB) {
  let closestColor = null;
  let minDistance = Infinity;

  const colors = await (await fetch('/resources/colors.json')).json()
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
  return fetch('/api/colors?word=' + word)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }
      return response.json();
    })
    .then((data) => {
      const colorsData = JSON.parse(data);
      const colors = colorsData.map(colorData => {
        const { r, g, b } = colorData;
        return new RGBColor(parseInt(r), parseInt(g), parseInt(b), 255); // Assuming the "a" value is set to 1 for all colors
      });
      return colors
    })
    .catch((error) => {
      console.log('An error occurred:', error);
    });
}

const imagewh = 100
async function loaded() {
  const { word, meaning, r, g, b } = parseurl()
  var selectedRGB = new RGBColor(r, g, b, 255)
  var RGBs = await getRGBs()
  RGBs = await matchcolorscount(RGBs, imagewh * imagewh)
  var LABs = await RGBs.map(x => RGBtoLAB(x))
  var selectedLAB = RGBtoLAB(selectedRGB)
  //var percent = nearcount(LABs, selectedLAB[0], selectedLAB[1], selectedLAB[2], 20) //비슷한 선택을 한 사람 수

  //mostcolor
  var mostcolor1 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  const delradiusarray = [15, 10, 5, 2, 0]
  if (LABs.length >= 3) {
    var delradiusindex = 0
    while (neardelete(LABs, RGBtoLAB(mostcolor1), delradiusarray[delradiusindex]).length < 2) {
      delradiusindex += 1
    }
    LABs = neardelete(LABs, RGBtoLAB(mostcolor1), delradiusarray[delradiusindex])
    var mostcolor2 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  }
  else {
    mostcolor2 = mostcolor1
  }
  if (LABs.length >= 2) {
    var delradiusindex = 0
    while (neardelete(LABs, RGBtoLAB(mostcolor2), delradiusarray[delradiusindex]).length < 1) {
      delradiusindex += 1
    }
    LABs = neardelete(LABs, RGBtoLAB(mostcolor2), delradiusarray[delradiusindex])
    var mostcolor3 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  }
  else {
    mostcolor3 = mostcolor2
  }
  document.getElementById("sel0").style.backgroundColor = `rgb(${selectedRGB.r}, ${selectedRGB.g}, ${selectedRGB.b})`
  document.getElementById("sel1").style.backgroundColor = `rgb(${mostcolor1.r}, ${mostcolor1.g}, ${mostcolor1.b})`
  document.getElementById("sel2").style.backgroundColor = `rgb(${mostcolor2.r}, ${mostcolor2.g}, ${mostcolor2.b})`
  document.getElementById("sel3").style.backgroundColor = `rgb(${mostcolor3.r}, ${mostcolor3.g}, ${mostcolor3.b})`

  document.getElementById("name0").textContent = await identifyColor(selectedRGB)
  document.getElementById("name1").textContent = await identifyColor(mostcolor1)
  document.getElementById("name2").textContent = await identifyColor(mostcolor2)
  document.getElementById("name3").textContent = await identifyColor(mostcolor3)

  document.getElementById("word").textContent = word
  document.getElementById("meaning").textContent = meaning

  makeimage(RGBs)
}

function nearestcolor(RGBs, RGB) {
  var min = Infinity
  var minval = false
  for (var i = 0; i < RGBs.length; i++) {
    var dist = colordist(RGBs[i], RGB)
    if (dist < min) {
      minval = RGBs[i]
      min = dist
    }
  }
  return minval
}

function makeimage(RGBs) {
  var canvas = document.getElementById('colorsort')
  var ctx = canvas.getContext('2d');

  //pixels init
  var pixels = []
  for (var i = 0; i < imagewh; i++) {
    var row = []
    for (var j = 0; j < imagewh; j++) {
      row.push(false)
    }
    pixels.push(row)
  }

  var LABs = RGBs.map(RGB => RGBtoLAB(RGB))
  var mainRGB = LABtoRGB(mostcolor(LABs))
  pixels[imagewh / 2][imagewh / 2] = mainRGB
  RGBs.splice(0, 1)
  let limitdist = 10
  step()
  function step() {
    var prepixels = structuredClone(pixels);
    for (var i = 0; i < imagewh; i++) {
      for (var j = 0; j < imagewh; j++) {
        if (prepixels[i][j] != false) continue;
        var [aroundRGB, aroundcount] = aroundcolor(pixels, prepixels, i, j)
        possibilities = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3]
        if (aroundcount <= possibilities[Math.floor(Math.random() * 10)]) {
          continue;
        }
        var idealRGB = biasavgcolor(mainRGB, aroundRGB, 50)
        var mindist = 10000000
        var minloc = 0
        for (var k = 0; k < RGBs.length; k++) {
          if (colordist(RGBs[k], idealRGB) < mindist) {
            mindist = colordist(RGBs[k], idealRGB)
            minloc = k
          }
        }
        if (aroundcount <= Math.random() * 6 + 2 && colordist(RGBs[minloc], aroundRGB) > limitdist) {
          limitdist += 5
          continue
        }
        else { limitdist -= 5 }
        pixels[i][j] = RGBs[minloc]
        RGBs.splice(minloc, 1)
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
  var img = ctx.createImageData(imagewh, imagewh);
  //pixels to img
  for (var i = 0; i < imagewh; i++) {
    for (var j = 0; j < imagewh; j++) {
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
  var matchedRGBs = structuredClone(RGBs);
  while (matchedRGBs.length > targetnum) {
    matchedRGBs.splice(Math.floor(Math.random() * (matchedRGBs.length)), 1)
  }
  while (matchedRGBs.length < targetnum) {
    matchedRGBs.push(RGBnoise(RGBs[Math.floor(Math.random() * (RGBs.length))]))
  }
  return matchedRGBs
}

function RGBnoise(RGB) {
  var r = Math.min(Math.max(0, RGB.r + Math.floor(Math.random() * 20 - 10)), 255)
  var g = Math.min(Math.max(0, RGB.g + Math.floor(Math.random() * 20 - 10)), 255)
  var b = Math.min(Math.max(0, RGB.b + Math.floor(Math.random() * 20 - 10)), 255)
  return new RGBColor(r, g, b, RGB.a)
}

function colordist(RGB1, RGB2) {
  var LAB1 = RGBtoLAB(RGB1)
  var LAB2 = RGBtoLAB(RGB2)
  return Math.pow(LAB1[0] - LAB2[0], 2) + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}
function colordistlab(LAB1, LAB2) {
  var LAB1 = LAB1
  var LAB2 = LAB2
  return Math.pow(LAB1[0] - LAB2[0], 2) + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}

function aroundcolor(pixels, prepixels, i, j) {
  var RGBlist = []
  var aroundlist = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  for (var k = 0; k < aroundlist.length; k++) {
    var x = i + aroundlist[k][0]
    var y = j + aroundlist[k][1]
    if (imagewh > x && imagewh > y && x >= 0 && y >= 0 && prepixels[x][y] != false) {
      RGBlist.push(pixels[x][y])
    }
  }
  return [avgcolor(RGBlist), RGBlist.length]
}

function avgcolor(RGBlist) {
  var result = new RGBColor(0, 0, 0, 255)
  for (var i = 0; i < RGBlist.length; i++) {
    var RGB = RGBlist[i]
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
  var result = new RGBColor(0, 0, 0, 255)
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

  var bias = new RGBColor(0, 100, 155, 255)
  var bstrength = 1
  var RGBslist = []
  for (var i = 0; i < RGBscount; i++) {
    var red = Math.round(Math.random() * 255)
    var green = Math.round(Math.random() * 255)
    var blue = Math.round(Math.random() * 255)
    var alpha = 255
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

// CIELAB
var cache = new Array(256)
for (var i = 0; i < 256; i++) {
  cache[i] = new Array(256)
  for (var j = 0; j < 256; j++) {
    cache[i][j] = new Array(256).fill(0)
  }
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
  var x = xyz[0], y = xyz[1], z = xyz[2];
  var filteredLABs = [];

  for (var i = 0; i < LABs.length; i++) {
    var dist = colordistlab(LABs[i], [x, y, z]);
    if (dist > (radius * radius)) {
      filteredLABs.push(LABs[i]);
    }
  }

  return filteredLABs;
}

function approach(LABs, xyz, step, stepcount) {
  var offsets = [];
  for (var i = -stepcount; i <= stepcount; i++) {
    for (var j = -stepcount; j <= stepcount; j++) {
      for (var k = -stepcount; k <= stepcount; k++) {
        offsets.push([i, j, k]);
      }
    }
  }
  var max = 0
  resultxyz = structuredClone(xyz);
  for (var i = 0; i < offsets.length; i++) {
    var x = xyz[0] + offsets[i][0] * step
    var y = xyz[1] + offsets[i][1] * step
    var z = xyz[2] + offsets[i][2] * step
    //var nearcountres = nearcount(LABs, x, y, z, radius)
    var nearcountres = LABs.reduce((accumulator, current) => accumulator + 1 / colordistlab(current, [x, y, z]), 0);
    if (nearcountres > max) {
      max = nearcountres
      resultxyz = [x, y, z]
    }
  }
  return resultxyz
}

function nearcount(LABs, x, y, z, radius) {
  count = 0
  for (var i = 0; i < LABs.length; i++) {
    var dist = colordistlab(LABs[i], [x, y, z])
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

function RGBtoLAB(RGB) {
  if (cache[RGB.r][RGB.g][RGB.b] !== 0) {
    return cache[RGB.r][RGB.g][RGB.b]
  }

  var r = RGB.r
  var g = RGB.g
  var b = RGB.b

  let rPrime = r / 255;
  let gPrime = g / 255;
  let bPrime = b / 255;

  if (rPrime > 0.04045) {
    rPrime = Math.pow(((rPrime + 0.055) / 1.055), 2.4);
  } else {
    rPrime /= 12.92;
  }

  if (gPrime > 0.04045) {
    gPrime = Math.pow(((gPrime + 0.055) / 1.055), 2.4);
  } else {
    gPrime /= 12.92;
  }

  if (bPrime > 0.04045) {
    bPrime = Math.pow(((bPrime + 0.055) / 1.055), 2.4);
  } else {
    bPrime /= 12.92;
  }

  let x = (rPrime * 0.4124 + gPrime * 0.3576 + bPrime * 0.1805) / 0.95047;
  let y = (rPrime * 0.2126 + gPrime * 0.7152 + bPrime * 0.0722) / 1.00000;
  let z = (rPrime * 0.0193 + gPrime * 0.1192 + bPrime * 0.9505) / 1.08883;

  if (x > 0.008856) {
    x = Math.pow(x, (1 / 3));
  } else {
    x = (7.787 * x) + (16 / 116);
  }

  if (y > 0.008856) {
    y = Math.pow(y, (1 / 3));
  } else {
    y = (7.787 * y) + (16 / 116);
  }

  if (z > 0.008856) {
    z = Math.pow(z, (1 / 3));
  } else {
    z = (7.787 * z) + (16 / 116);
  }

  let L = (116 * y) - 16;
  let A = 500 * (x - y);
  let B = 200 * (y - z);

  cache[RGB.r][RGB.g][RGB.b] = [L, A, B]
  return [L, A, B];
}
