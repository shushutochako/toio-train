/**
 * MathExt
 */
export class MathExt {
  
  static distance(params: MathExt.DistanceParams): number {
    const diffX = params.x1 - params.x2;
    const diffY = params.y1 - params.y2;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  } 

  static relativeAngle(params: MathExt.RelAngleParams): number {
    const diffX = params.x - params.targetX;
    const diffY = params.y - params.targetY;
    let relAngle = (Math.atan2(diffY, diffX) * 180) / Math.PI - params.angle;
    relAngle = relAngle % 360;
    if (relAngle < -180) {
      relAngle += 360;
    } else if (relAngle > 180) {
      relAngle -= 360;
    }
    return relAngle;
  }
}

export namespace MathExt {
  export type DistanceParams = {
    x1: number,
    y1: number,
    x2: number,
    y2: number
  }
  export type RelAngleParams = {
    x: number,
    y: number,
    angle: number,
    targetX: number,
    targetY: number
  }
}