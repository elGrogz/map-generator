function drawGraticules() {
  const graticules = d3
    .geoGraticule()
    .step(GRATICULE_DEGREE_STEP)
    .extent([
      [MAP_BOUNDING_COORDS.bottomX, MAP_BOUNDING_COORDS.bottomY],
      [MAP_BOUNDING_COORDS.topX, MAP_BOUNDING_COORDS.topY],
    ])
    .precision(0.1)();
  console.log({ graticules });

  context.strokeStyle = COLOUR_GRATICULE;
  context.lineWidth = 0.75;
  context.beginPath();
  geoPathGenerator(graticules);
  context.stroke();
  context.closePath();
}
