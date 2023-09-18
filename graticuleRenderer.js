// let uniqueLongitudeGraticuleCoords = [];
// let uniqueLatitudeGraticuleCoords = [];

let longitudeGraticuleCoords = new Set();
let latitudeGraticuleCoords = new Set();

// draw graticules using geoGraticule on the canvas
function drawGraticules() {
  const graticules = d3
    .geoGraticule()
    .step(GRATICULE_DEGREE_STEP)
    .extent([
      [MAP_BOUNDING_COORDS.bottomX, MAP_BOUNDING_COORDS.bottomY],
      [MAP_BOUNDING_COORDS.topX, MAP_BOUNDING_COORDS.topY],
    ])
    .precision(0.1)();

  // console.log({ graticules });

  getUniqueGraticuleCoordindates(graticules);

  context.strokeStyle = COLOUR_GRATICULE;
  context.lineWidth = 2;
  context.beginPath();
  geoPathGenerator(graticules);
  context.stroke();
  context.closePath();

  drawGraticuleLabels();
}

// draw graticule coordinates on the map's edge on the SVG
function drawGraticuleLabels() {
  const graticuleLabelsGroup = g
    .append("g")
    .attr("id", "graticule-label-group")
    .attr("fill", COLOUR_GRATICULE_LABEL)
    .attr("font-size", 30)
    .attr("font-style", "Italic")
    .style("text-anchor", "middle")
    .style("font-family", `${CITY_FONT}`);

  longtitudeGraticuleCoordArray = Array.from(longitudeGraticuleCoords);
  latitudeGraticuleCoordArray = Array.from(latitudeGraticuleCoords);

  // console.log(longtitudeGraticuleCoordArray);

  const xLongtitudeCoordData = longtitudeGraticuleCoordArray.map((coord) => {
    const [topX, topY] = projection([coord, MAP_BOUNDING_COORDS.topY]);
    const [bottomX, bottomY] = projection([coord, MAP_BOUNDING_COORDS.bottomY]);

    return {
      mode: "longitude",
      coord: coord,
      topX: topX,
      topY: topY,
      bottomX: bottomX,
      bottomY: bottomY,
    };
  });

  const yLatitudeCoordData = latitudeGraticuleCoordArray.map((coord) => {
    const [topX, topY] = projection([MAP_BOUNDING_COORDS.topX, coord]);
    const [bottomX, bottomY] = projection([MAP_BOUNDING_COORDS.bottomX, coord]);

    return {
      mode: "latitude",
      coord: coord,
      topX: topX,
      topY: topY,
      bottomX: bottomX,
      bottomY: bottomY,
    };
  });

  // console.log({ xLongtitudeCoordData });
  // console.log({ yLatitudeCoordData });

  const xGraticuleLabelGroup = graticuleLabelsGroup
    .append("g")
    .attr("id", "x-graticule-labels-group");

  const xGraticuleLabelElements = xGraticuleLabelGroup
    .selectAll(".x-graticule-labels-group")
    .data(xLongtitudeCoordData)
    .join("g");

  xGraticuleLabelElements
    .append("text")
    .attr("class", "top-x-graticule-label")
    .attr("x", (d) => d.topX)
    .attr("y", (d) => d.topY)
    .text((d) => d.coord);

  xGraticuleLabelElements
    .append("text")
    .attr("class", "bottom-x-graticule-label")
    .attr("x", (d) => d.bottomX)
    .attr("y", (d) => d.bottomY)
    .text((d) => d.coord);

  const yGraticuleLabelGroup = graticuleLabelsGroup
    .append("g")
    .attr("id", "y-graticule-labels-group");
}

function drawGraticuleCrosses() {}

function getUniqueGraticuleCoordindates(graticules) {
  graticules.coordinates.forEach((coordinates) => {
    console.log({ coordinates });

    // if (coordinates.length === 2) {
    coordinates.forEach((coordinate) => {
      const longCoord = coordinate[0].toFixed(4);
      const latCoord = coordinate[1].toFixed(4);

      longitudeGraticuleCoords.add(longCoord);
      latitudeGraticuleCoords.add(latCoord);
    });
    // }
  });
}
