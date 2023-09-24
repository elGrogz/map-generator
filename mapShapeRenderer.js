function drawSea() {
  context.fillStyle = COLOUR_WATER;
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawCoastline() {
  context.save();
  context.fillStyle = COLOUR_LAND;
  context.shadowBlur = WATER_SHADOW_BLUR_THICKNESS;
  context.shadowColor = COLOUR_WATER_SHADOW;

  context.beginPath();

  coastline.features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      drawPolygons(feature.geometry.coordinates);
    }
  });

  context.stroke();
  context.fill();
  context.restore();
}

const gradients = [
  // "#5fc971",
  // "#65bf66",
  // "#69b55b",
  // "#6cab51",
  // "#6da148",
  // "#6e9740",
  // "#6e8d39",
  // "#6d8432",
  // "#6b7b2c",
  // "#697226",
  // "#666922",
  // "#62601e",
  // "#5e571a",
  // "#594f17",
  // "#544714",
  // "#4f3f11",
  // "#49370f",
  // "#43300d",
  // "#3d290a",
  // "#362206",

  "#6efa7b",
  "#61f67f",
  "#53f283",
  "#44ee87",
  "#32e98a",
  "#1ae58e",
  "#00e191",
  "#00dc94",
  "#00d896",
  "#00d398",
  "#00cf9a",
  "#00ca9c",
  "#00c69e",
  "#00c19f",
  "#00bca0",
  "#00b7a0",
  "#00b3a1",
  "#00aea1",
  "#00a9a0",
  "#00a5a0",
  "#00a09f",
  "#009b9d",
  "#00969c",
  "#00919a",
  "#008d97",
  "#008895",
  "#008392",
  "#007e8f",
  "#007a8c",
  "#007588",
  "#007084",
  "#006c80",
  "#00677c",
  "#066277",
  "#135e72",
  "#1b596d",
  "#215568",
  "#255163",
  "#284c5d",
  "#2a4858",
];

// const gradients = [
//   "#5fc971",
//   "#63c56d",
//   "#66c168",
//   "#69be64",
//   "#6cba61",
//   "#6eb65d",
//   "#70b259",
//   "#72ae56",
//   "#74ab53",
//   "#75a750",
//   "#76a34d",
//   "#77a04a",
//   "#789c48",
//   "#789845",
//   "#799543",
//   "#799141",
//   "#798e3f",
//   "#798a3d",
//   "#78863b",
//   "#78833a",
//   "#788038",
//   "#777c37",
//   "#767936",
//   "#757535",
//   "#747234",
//   "#736f33",
//   "#726b32",
//   "#706831",
//   "#6f6530",
//   "#6d622f",
//   "#6c5f2f",
//   "#6a5c2e",
//   "#68592e",
//   "#66562d",
//   "#64532c",
//   "#62502c",
//   "#5f4d2b",
//   "#5d4a2b",
//   "#5b482a",
//   "#58452a",
// ];

function drawContours() {
  context.save();
  context.strokeStyle = "#5F7161";
  const thickLevels = [200, 400, 600, 800, 1000, 1200, 1400];

  let shadeIndex = 0;

  contours.features.forEach((contour) => {
    if (+contour.properties.level >= 0) {
      const level = +contour.properties.level;

      context.beginPath();
      drawPolygons(contour.geometry.coordinates);

      context.lineWidth = thickLevels.indexOf(level) > 0 ? 0.5 : 0.25;
      context.fillStyle = gradients[shadeIndex] ?? "#bed9e2";

      console.log(shadeIndex);
      console.log(gradients[shadeIndex]);

      context.fill();
      context.stroke();

      shadeIndex++;
    }

    // Clip anything outside the coastline - data can sometimes include random contours in the sea
    context.beginPath();
    coastline.features.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        drawPolygons(feature.geometry.coordinates);
      }
    });
    context.clip();
    context.closePath();
  });
  context.restore();

  // context.save();
  // context.beginPath();
  // context.clip();
  // coastline.features.forEach((feature) => {
  //   if (feature.geometry.type === "Polygon") {
  //     drawPolygons(feature.geometry.coordinates);
  //   }
  // });
  // context.stroke();
  // context.restore();
}

function drawWaterMultiPolygons() {
  context.save();
  context.fillStyle = COLOUR_WATER;
  // context.fillStyle = "#FFB4B4";

  // const gradient = context.createLinearGradient(0, HEIGHT, 0, 0);

  // gradient.addColorStop(0, "#95BDFF");
  // gradient.addColorStop(0.3, "#B4E4FF");
  // gradient.addColorStop(0.6, "#B4E4FF");
  // gradient.addColorStop(1, "#95BDFF");

  // context.fillStyle = gradient;
  // console.log({ water_multipolygons });

  water_multipolygons.features.forEach((feature) => {
    context.beginPath();
    if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((lines) => {
        drawPolygons(lines);
      });
      // drawPolygons(feature.geometry.coordinates);
    }
    context.fill();
    context.closePath();
  });
  context.restore();
}

function drawWaterPolygons() {
  context.save();
  context.fillStyle = COLOUR_WATER;
  // context.fillStyle = "#FFB4B4";

  // const gradient = context.createLinearGradient(0, HEIGHT, 0, 0);

  // gradient.addColorStop(0, "#95BDFF");
  // gradient.addColorStop(0.3, "#B4E4FF");
  // gradient.addColorStop(0.6, "#B4E4FF");
  // gradient.addColorStop(1, "#95BDFF");

  // context.fillStyle = gradient;

  water_polygons.features.forEach((feature) => {
    context.beginPath();
    if (feature.geometry.type === "Polygon") {
      // console.log({ feature });
      // geoPathGenerator(feature);
      drawPolygons(feature.geometry.coordinates);
    }
    context.fill();
    context.closePath();
  });
  context.restore();
}
