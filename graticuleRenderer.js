let uniquelongitudeGraticuleCoords = [];
let uniquelatitudeGraticuleCoords = [];

function drawGraticules() {
  const graticules = d3
    .geoGraticule()
    .step(GRATICULE_DEGREE_STEP)
    .extent([
      [MAP_BOUNDING_COORDS.bottomX, MAP_BOUNDING_COORDS.bottomY],
      [MAP_BOUNDING_COORDS.topX, MAP_BOUNDING_COORDS.topY],
    ])
    .precision(0.1)();

  graticules.coordinates.forEach((coordinates) => {
    console.log({ coordinates });
    coordinates.forEach((coordinate) => {
      const longCoord = coordinate[0];
      const latCoord = coordinate[1];

      if (!uniquelatitudeGraticuleCoords.includes(longCoord)) {
        uniquelongitudeGraticuleCoords.push(longCoord);
      }

      if (!uniquelatitudeGraticuleCoords.includes(latCoord)) {
        uniquelatitudeGraticuleCoords.push(latCoord);
      }
    });

    console.log({ uniquelatitudeGraticuleCoords });
    console.log({ uniquelongitudeGraticuleCoords });
  });

  // console.log({ graticules });

  context.strokeStyle = COLOUR_GRATICULE;
  context.lineWidth = 0.75;
  context.beginPath();
  geoPathGenerator(graticules);
  context.stroke();
  context.closePath();
}

function drawGraticuleLabels() {}

function drawGraticuleCrosses() {}
