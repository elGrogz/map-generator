function drawSea() {
  context.fillStyle = COLOUR_WATER;
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawCoastline() {
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
}
