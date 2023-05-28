export class MapRenderer {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.seaFillStyle = null;
  }

  drawSea(context) {
    context.fillStyle = this.seaFillStyle;
  }
}
