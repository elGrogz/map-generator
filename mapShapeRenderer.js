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

function drawContours() {
  context.save();
  context.strokeStyle = "#5F7161";
  const thickLevels = [200, 400, 600, 800, 1000, 1200, 1400];

  contours.features.forEach((contour) => {
    if (+contour.properties.level >= 50) {
      context.beginPath();
      // geoPathGenerator(contour);
      drawPolygons(contour.geometry.coordinates);
      // console.log("canvas", { context });

      let fillShade;

      const level = +contour.properties.level;

      // https://maketintsandshades.com/#93BFCF
      // if (level >= 50 && level <= 99) {
      //   fillShade = "#bed9e2";
      // } else if (level >= 100 && level <= 199) {
      //   fillShade = "#b3d2dd";
      // fillShade = "#bed9e2";
      if (level <= 199) {
        fillShade = "#bed9e2";
      } else if (level >= 200 && level <= 299) {
        fillShade = "#a9ccd9";
      } else if (level >= 300 && level <= 399) {
        fillShade = "#9ec5d4";
      } else if (level >= 400 && level <= 499) {
        fillShade = "#93bfcf";
      } else if (level >= 500 && level <= 599) {
        fillShade = "#84acba";
      } else if (level >= 600 && level <= 699) {
        fillShade = "#7699a6";
      } else if (level >= 700 && level <= 799) {
        fillShade = "#678691";
      } else if (level >= 800 && level <= 899) {
        fillShade = "#58737c";
      } else if (level >= 900 && level <= 999) {
        fillShade = "#4a6068";
      } else if (level >= 1000 && level <= 1099) {
        fillShade = "#3b4c53";
      } else if (level >= 1100 && level <= 1199) {
        fillShade = "#2c393e";
      } else if (level >= 1200 && level <= 1299) {
        fillShade = "#1d2629";
      } else if (level >= 1300) {
        fillShade = "#0f1315";
      }

      context.fillStyle = fillShade;

      const lw = thickLevels.indexOf(level) > 0 ? 2 : 1;

      context.lineWidth = lw;

      // console.log(
      //   `canvas fill style for ${contour.properties.level}`,
      //   context.fillStyle
      // );

      context.fill();
      context.stroke();
    }

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
