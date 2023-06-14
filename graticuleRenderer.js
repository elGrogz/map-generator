// let uniqueLongitudeGraticuleCoords = [];
// let uniqueLatitudeGraticuleCoords = [];

let longitudeGraticuleCoords = new Set();
let latitudeGraticuleCoords = new Set();

function drawGraticules() {
  const graticules = d3
    .geoGraticule()
    .step(GRATICULE_DEGREE_STEP)
    .extent([
      [MAP_BOUNDING_COORDS.bottomX, MAP_BOUNDING_COORDS.bottomY],
      [MAP_BOUNDING_COORDS.topX, MAP_BOUNDING_COORDS.topY],
    ])
    .precision(0.1)();

  getUniqueGraticuleCoordindates(graticules);

  context.strokeStyle = COLOUR_GRATICULE;
  context.lineWidth = 0.75;
  context.beginPath();
  geoPathGenerator(graticules);
  context.stroke();
  context.closePath();
}

function drawGraticuleLabels() {
  longitudeGraticuleCoords = [];
}

function drawGraticuleCrosses() {}

function getUniqueGraticuleCoordindates(graticules) {
  graticules.coordinates.forEach((coordinates) => {
    coordinates.forEach((coordinate) => {
      const longCoord = coordinate[0].toFixed(4);
      const latCoord = coordinate[1].toFixed(4);

      longitudeGraticuleCoords.add(longCoord);
      latitudeGraticuleCoords.add(latCoord);
    });
  });

  console.log(longitudeGraticuleCoords);
}
