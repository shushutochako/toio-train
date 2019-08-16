/**
 * IdInformation
 */
export class IdInformation {

  private _id: number;
  private _positionX: number;
  private _positionY: number;
  private _angle: number;

  constructor(buf: DataView) {
    this._id = buf.getUint8(0);
    if (this._id === 1) {
      this._positionX = buf.getUint16(1, true);
      this._positionY = buf.getUint16(3, true);
      this._angle = buf.getUint16(5, true);
    }
  }

  get id(): number {
    return this._id;
  }

  get positionX(): number {
    return this._positionX;
  }

  get positionY(): number {
    return this._positionY;
  }

  get angle(): number {
    return this._angle;
  }

  get onMat(): boolean {
    return this._id === 1;
  }
}