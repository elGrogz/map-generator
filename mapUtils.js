function clipCanvasToRectangle() {
  context.beginPath();
  context.rect(0, 0, WIDTH, HEIGHT);
  context.clip();
}

function drawPolygons(coordinates) {
  coordinates.forEach((coords) => {
    coords.forEach((point, i) => {
      const [x, y] = projection(point);
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
  });
  context.closePath();
}
