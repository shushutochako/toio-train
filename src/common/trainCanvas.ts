import { MathExt } from './mathExt';
import { Colors } from './colors';

/**
 * TrainCanvas
 */
export class TrainCanvas {
  private _drawPoints: Array<TrainCanvas.Point> = [];
  private context: CanvasRenderingContext2D;
  private mouseX: number = Number.MAX_SAFE_INTEGER;
  private mouseY: number = Number.MAX_SAFE_INTEGER;
  private params: TrainCanvas.Params;
  private _startPoint: TrainCanvas.Point; 

  constructor(canvas: HTMLCanvasElement, params: TrainCanvas.Params) {
    this.context = canvas.getContext("2d");
    this.params = params;
    this.mouseX = Number.MAX_SAFE_INTEGER;
    this.mouseY = Number.MAX_SAFE_INTEGER;

    canvas.addEventListener("mousemove", this.onMouseMove, false);
    canvas.addEventListener("mousedown", this.onCanvasClick, false);
    canvas.addEventListener("mouseup", this.drawEnd, false);
    canvas.addEventListener("mouseout", this.drawEnd, false);
  }

  get startPoint(): TrainCanvas.Point {
    return this._startPoint;
  }

  set startPoint(point: TrainCanvas.Point) {
    if (!this._startPoint) {
      this.drawStartPoint(point.x, point.y);
    }
    this._startPoint = point;
  }

  get drawPoints(): Array<TrainCanvas.Point> {
    return this._drawPoints;
  }

  clear(isAllClear: boolean) {
    this.render();
    if (!isAllClear && this._startPoint) {
      this.drawStartPoint(
        this._startPoint.x,
        this._startPoint.y
      );
    }
  }

  private render() {
    this.context.beginPath();
    this.context.fillStyle = Colors.Canvas;
    this.context.globalAlpha = 1.0;
    this.context.fillRect(0, 0, 410, 410);
  }

  // Mouse Events

  private onCanvasClick(e: any) {
    if (e.button === 0) {
      var rect = e.target.getBoundingClientRect();
      var x = ~~(e.clientX - rect.left);
      var y = ~~(e.clientY - rect.top);
      this.draw(x, y);
    }
  }

  private onMouseMove(e: any) {
    if (e.buttons === 1 || e.witch === 1) {
      var rect = e.target.getBoundingClientRect();
      var x = ~~(e.clientX - rect.left);
      var y = ~~(e.clientY - rect.top);
      this.draw(x, y);
    }
  }

  private drawStartPoint(x: number, y: number) {
    this.context.beginPath();
    this.context.fillStyle = Colors.StartPoint;
    this.context.arc( x - 45, y - 45, 10, (0 * Math.PI) / 180, (360 * Math.PI) / 180, false);
    this.context.fill();
  }

  private draw(x: number, y: number) {
    this.context.beginPath();
    this.context.globalAlpha = 1.0;
    if (this.mouseX === Number.MAX_SAFE_INTEGER) {
      this._drawPoints = [];
      this.context.moveTo(x, y);
    } else {
      this.context.moveTo(this.mouseX, this.mouseY);
    }
    this.context.lineTo(x, y);
    this._drawPoints.push({
      x: x + 45,
      y: y + 45
    });
    this.context.lineCap = "round";
    this.context.lineWidth = this.params.lineWidth;
    this.context.strokeStyle = this.params.lineColor;
    this.context.stroke();

    this.mouseX = x;
    this.mouseY = y;
  }

  private drawEnd() {
    this.mouseX = Number.MAX_SAFE_INTEGER;
    this.mouseY = Number.MAX_SAFE_INTEGER;
  }
}

namespace TrainCanvas {
  export type Point = { x: number,y: number}
  export type Params = { color: Colors, lineWidth: number,lineColor: Colors, startPointColor: Colors}
}