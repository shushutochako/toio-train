<template>
  <div class="container">
    <div class="cavasContainer">
      <canvas id="canvas" width="400" height="400"></canvas>
    </div>
    <div class="buttonContainer">
      <v-btn
        class="actionButton"
        color="success"
        @click="onConnectClick()"
        v-bind:disabled="isConnected"
      >Connect</v-btn>
      <v-btn class="actionButton" color="success" @click="onStartClick()">Start</v-btn>
      <v-btn class="actionButton" color="success" @click="onClearClick()">Clear</v-btn>
      <v-btn
        class="actionButton"
        color="success"
        @click="onDisconnectClick()"
        v-bind:disabled="!isConnected"
      >Disconnect</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Context } from "mocha";
import { ServiceUUID, CharacteristicUUID } from "../common/uuids";
import { IdInformation } from "../common/idInformation";

/**
 * Colors
 */
enum Colors {
  Canvas = "#e6e6e6",
  Line = "#555555",
  StartPoint = "#00B0FF"
}

/**
 * Consts
 */
const Consts = {
  LineWidth: 1
};

/**
 * Melody
 */
const Melody = {
  HARU: [
    3,
    1,
    28,
    2285,127,255,
    285,79,255,
    285,84,255,
    285,88,255,
    285,79,255,
    285,83,255,
    285,86,255,
    285,77,255,
    285,81,255,
    285,84,255,
    285,81,255,
    285,83,255,
    285,79,255,
    285,79,255,
    285,84,255,
    285,88,255,
    285,79,255,
    285,83,255,
    285,86,255,
    285,76,255,
    285,81,255,
    285,84,255,
    285,81,255,
    285,83,255,
    285,86,255,
    57,72,255,
    57,76,255,
    114,79,255
  ]
}

@Component
export default class Train extends Vue {
  private id: string = "";
  private points: Array<any> = [];
  private ctx!: CanvasRenderingContext2D;
  private mouseX: number = Number.MAX_SAFE_INTEGER;
  private mouseY: number = Number.MAX_SAFE_INTEGER;
  private isConnected = false;
  private cube: BluetoothDevice = null;
  private motorControl: any = null;
  private soundControl: any = null;
  private currentPosition!: IdInformation;
  private startPosition!: IdInformation;
  private nextPointIndex: number = 0;
  private timerId: number = Number.MAX_SAFE_INTEGER;
  private stopTimerId: number = Number.MAX_SAFE_INTEGER;

  mounted(): void {
    this.isConnected = false;
    this.cube = null;

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");

    this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    this.ctx.beginPath();
    this.ctx.fillStyle = Colors.Canvas;
    this.ctx.fillRect(0, 0, 410, 410);

    this.mouseX = Number.MAX_SAFE_INTEGER;
    this.mouseY = Number.MAX_SAFE_INTEGER;

    canvas.addEventListener("mousemove", this.onMouseMove, false);
    canvas.addEventListener("mousedown", this.onCanvasClick, false);
    canvas.addEventListener("mouseup", this.drawEnd, false);
    canvas.addEventListener("mouseout", this.drawEnd, false);
  }

  onCanvasClick(e: any) {
    if (e.button === 0) {
      var rect = e.target.getBoundingClientRect();
      var x = ~~(e.clientX - rect.left);
      var y = ~~(e.clientY - rect.top);
      this.draw(x, y);
    }
  }

  onMouseMove(e: any) {
    if (e.buttons === 1 || e.witch === 1) {
      var rect = e.target.getBoundingClientRect();
      var x = ~~(e.clientX - rect.left);
      var y = ~~(e.clientY - rect.top);
      this.draw(x, y);
    }
  }

  private drawStartPoint(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.fillStyle = Colors.StartPoint;
    this.ctx.arc( x - 45, y - 45, 10, 0 * Math.PI / 180, 360 * Math.PI / 180, false ) ;
    this.ctx.fill() ;
  }

  draw(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.globalAlpha = 1.0;
    if (this.mouseX === Number.MAX_SAFE_INTEGER) {
      this.points = [];
      this.ctx.moveTo(x, y);
    } else {
      this.ctx.moveTo(this.mouseX, this.mouseY);
    }
    this.ctx.lineTo(x, y);
    this.points.push({
      x: x + 45,
      y: y + 45
    });
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = Consts.LineWidth;
    this.ctx.strokeStyle = Colors.Line;
    this.ctx.stroke();

    this.mouseX = x;
    this.mouseY = y;
  }

  drawEnd() {
    this.mouseX = Number.MAX_SAFE_INTEGER;
    this.mouseY = Number.MAX_SAFE_INTEGER;
    // adjust points
    let latestPoint: any = {};
    const newPoints = this.points.filter((elm, i) => {
      if (i === 0) {
        latestPoint = elm;
        return true;
      } else if (i === this.points.length - 1) {
        return true;
      } else {
        const distance = this._distance(
          elm.x,
          elm.y,
          latestPoint.x,
          latestPoint.y
        );
        if (distance >= 5) {
          latestPoint = elm;
          return true;
        }
        return false;
      }
    });
    this.points = newPoints;
  }

  onConnectClick() {
    this.startScan();
  }

  onStartClick() {
    console.log("onStartClick");
    this.start();
  }

  onClearClick() {
    this.clearCanvas(false);
  }

  onDisconnectClick() {
    if (this.timerId !== Number.MAX_SAFE_INTEGER) {
      clearInterval(this.timerId);
    }
    if (!this.cube) {
      return;
    }
    this.cube.gatt.disconnect();
    this.cube = null;
    this.isConnected = false;
    this.startPosition = null;
    this.points = [];
    this.nextPointIndex = 0;
    this.clearCanvas(true);
    this.startPosition = null;
  }

  onChangeIdInformation(event: any) {
    let characteristic = event.target;
    this.currentPosition = new IdInformation(characteristic.value);
    if (!this.startPosition) {
      this.startPosition = this.currentPosition;
      this.drawStartPoint(
        this.startPosition.positionX,
        this.startPosition.positionY
      );
    }
  }
  
  private async start() {
    await this.playMelody();
    this.stopTimerId = setInterval(() => {
      if (this.nextPointIndex >= this.points.length - 1) {
        const lastPoint = this.points[this.points.length - 1];
        const distance = this._distance(
          lastPoint.x,
          lastPoint.y,
          this.currentPosition.positionX,
          this.currentPosition.positionY
        );
        if (distance <= 25) {
          clearInterval(this.timerId);
          clearInterval(this.stopTimerId);
          this.stop();
          this.points = [];
          this.nextPointIndex = 0;
          this.clearCanvas(true);
          this.startPosition = null;
        }
      }
    }, 15);

    this.timerId = setInterval(() => {
      if (this.nextPointIndex < this.points.length - 1) {
        this.nextPointIndex++;
      }
      const nextPoint = this.points[this.nextPointIndex];
      const chaseResult = this.chase(
        nextPoint.x,
        nextPoint.y,
        this.currentPosition.positionX,
        this.currentPosition.positionY,
        this.currentPosition.angle
      );
      this.move(chaseResult[0], chaseResult[1]);
    }, 50);
  }

  private playMelody() {
    return new Promise((resolve, reject) => {
      this.soundControl.writeValue(Uint8Array.from(Melody.HARU));
      setTimeout(() => {
        resolve();
      }, 12000);
    });
  }

  private stop() {
    console.log("stop");
    this.motorControl.writeValue(Uint8Array.from([1, 1, 1, 0, 2, 1, 0]));
  }

  private move(left: number, right: number) {
    const data = this._motorMove(left, right);
    this.motorControl.writeValue(data.array);
  }

  private clearCanvas(isAllClear: boolean) {
    this.ctx.beginPath();
    this.ctx.fillStyle = Colors.Canvas;
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillRect(0, 0, 700, 400);
    if (!isAllClear && this.startPosition) {
      this.drawStartPoint(this.startPosition.positionX, this.startPosition.positionY);
    }
  }

  private _motorMove(left: number, right: number) {
    const lSign = left > 0 ? 1 : -1;
    const rSign = right > 0 ? 1 : -1;
    const lDirection = left > 0 ? 1 : 2;
    const rDirection = right > 0 ? 1 : 2;
    const lPower = Math.min(Math.abs(left), 100);
    const rPower = Math.min(Math.abs(right), 100);
    return {
      array: Uint8Array.from([1, 1, lDirection, lPower, 2, rDirection, rPower]),
      data: {
        left: lSign * lPower,
        right: rSign * rPower
      }
    };
  }

  private _clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
  }

  private _distance(
    targetX: number,
    targetY: number,
    x: number,
    y: number
  ): number {
    const diffX = targetX - x;
    const diffY = targetY - y;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }

  private chase(
    nextX: number,
    nextY: number,
    cubeX: number,
    cubeY: number,
    cubeAngle: number
  ) {
    const diffX = nextX - cubeX;
    const diffY = nextY - cubeY;
    const distance = this._distance(nextX, nextY, cubeX, cubeY);

    let relAngle = (Math.atan2(diffY, diffX) * 180) / Math.PI - cubeAngle;
    relAngle = relAngle % 360;
    if (relAngle < -180) {
      relAngle += 360;
    } else if (relAngle > 180) {
      relAngle -= 360;
    }

    const ratio = 1 - Math.abs(relAngle) / 90;
    let speed = 50;
    if (relAngle > 0) {
      return [speed, speed * ratio];
    } else {
      return [speed * ratio, speed];
    }
  }

  private async startScan() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          services: [ServiceUUID.PrimaryService.toLowerCase()]
        }
      ]
    });
    if (this.cube) {
      return;
    }
    this.cube = device;
    this.connect(device);
  }

  private async connect(device: BluetoothDevice) {
    const server = await device.gatt.connect();
    this.isConnected = true;
    const service = await server.getPrimaryService(
      ServiceUUID.PrimaryService.toLowerCase()
    );
    const idInformation = await service.getCharacteristic(
      CharacteristicUUID.IdInformation.toLowerCase()
    );
    idInformation.addEventListener(
      "characteristicvaluechanged",
      this.onChangeIdInformation
    );
    idInformation.startNotifications();

    this.motorControl = await service.getCharacteristic(
      CharacteristicUUID.MortorControl.toLowerCase()
    );
    this.soundControl = await service.getCharacteristic(
      CharacteristicUUID.SoundControl.toLowerCase()
    );
  }
}
</script>
<style scoped>
.container {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
}

.canvasContainer {
  width: 410px;
  height: 410px;
}

.buttonContainer {
  margin-left: 30px;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
}

.actionButton {
  margin-bottom: 30px;
  padding: 4px;
}
</style>