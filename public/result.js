class RGBColor {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }
}
const imagewh = 100
function loaded() {
  var selectedRGB = new RGBColor(0, 0, 0, 0)
  var RGBs = []
  RGBs = testcolors(imagewh * imagewh / 1)
  //TODO 받아오기
  var LABs = RGBs.map(x => RGBtoLAB(x))
  var selectedLAB = RGBtoLAB(selectedRGB)
  var percent = nearcount(LABs, selectedLAB[0], selectedLAB[1], selectedLAB[2], 20) //비슷한 선택을 한 사람 수
  var mostcolor1 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  LABs = neardelete(LABs, RGBtoLAB(mostcolor1), 40)
  var mostcolor2 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  LABs = neardelete(LABs, RGBtoLAB(mostcolor2), 40)
  var mostcolor3 = nearestcolor(RGBs, LABtoRGB(mostcolor(LABs)))
  document.body.style.background = `linear-gradient(90deg, rgb(${mostcolor1.r}, ${mostcolor1.g}, ${mostcolor1.b}) 0%, rgb(${mostcolor2.r}, ${mostcolor2.g}, ${mostcolor2.b}) 50%, rgb(${mostcolor3.r}, ${mostcolor3.g}, ${mostcolor3.b}) 100%)`;
  setTimeout(() => {
    RGBs = matchcolorscount(RGBs, imagewh * imagewh)//테스트케이스
    makeimage(RGBs)
  }, 10);
}

function nearestcolor(RGBs, RGB) {
  var min = 10000000000000
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
  step()
  function step() {
    console.log(`${imagewh * imagewh - RGBs.length} / ${imagewh * imagewh}`)
    var prepixels = JSON.parse(JSON.stringify(pixels));
    for (var i = 0; i < imagewh; i++) {
      for (var j = 0; j < imagewh; j++) {
        if (prepixels[i][j] != false) continue;
        var idealRGB = aroundcolor(pixels, prepixels, i, j)
        if (idealRGB == false) {
          continue;
        }
        idealRGB = biasavgcolor(mainRGB, idealRGB, 50)
        var mindist = 10000000
        var minloc = 0
        for (var k = 0; k < RGBs.length; k++) {
          if (colordist(RGBs[k], idealRGB) < mindist) {
            mindist = colordist(RGBs[k], idealRGB)
            minloc = k
          }
        }
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


function matchcolorscount(RGBs, targetnum) {
  var matchedRGBs = JSON.parse(JSON.stringify(RGBs));
  while (matchedRGBs.length > targetnum) {
    matchedRGBs.splice(Math.floor(Math.random() * (matchedRGBs.length)), 1)
  }
  while (matchedRGBs.length < targetnum) {
    matchedRGBs.push(RGBs[Math.floor(Math.random() * (RGBs.length))])
  }
  return matchedRGBs
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

  pixeltoextend = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3]
  if (RGBlist.length <= pixeltoextend[Math.floor(Math.random() * 10)]) {
    return false
  }
  return avgcolor(RGBlist)
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

  var bias = new RGBColor(000, 100, 155, 255)
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
  maxpoint = approach(LABs, maxpoint, 64)
  maxpoint = approach(LABs, maxpoint, 64)
  maxpoint = approach(LABs, maxpoint, 32)
  maxpoint = approach(LABs, maxpoint, 32)
  maxpoint = approach(LABs, maxpoint, 16)
  maxpoint = approach(LABs, maxpoint, 16)
  maxpoint = approach(LABs, maxpoint, 8)
  maxpoint = approach(LABs, maxpoint, 8)
  maxpoint = approach(LABs, maxpoint, 4)
  maxpoint = approach(LABs, maxpoint, 4)
  maxpoint = approach(LABs, maxpoint, 2)
  maxpoint = approach(LABs, maxpoint, 2)
  maxpoint = approach(LABs, maxpoint, 1)
  maxpoint = approach(LABs, maxpoint, 1)
  return maxpoint
}

function neardelete(LABs, xyz, radius) {
  var x = xyz[0], y = xyz[1], z = xyz[2]
  for (var i = 0; i < LABs.length; i++) {
    var dist = colordistlab(LABs[i], [x, y, z])
    if (dist <= (radius * radius)) {
      LABs.splice(i, 1)
      i -= 1
    }
  }
  return LABs
}

function approach(LABs, xyz, step) {
  var offsets = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1], [0, 1, 1], [1, 1, 0], [1, 0, 1], [1, 1, 1], [0, -1, -1], [-1, -1, 0], [-1, 0, -1], [-1, -1, -1], [0, 0, 0]]
  var max = 0
  resultxyz = JSON.parse(JSON.stringify(xyz));
  for (var i = 0; i < offsets.length; i++) {
    var x = xyz[0] + offsets[i][0] * step
    var y = xyz[1] + offsets[i][1] * step
    var z = xyz[2] + offsets[i][2] * step
    var nearcountres = nearcount(LABs, x, y, z, Math.max(step / 2, 15))
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
