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
import { Melody, Operation } from "../common/melodies";
import { Cube } from "../common/Cube";
import { TrainCanvas } from "../common/TrainCanvas";
import { MathExt} from "../common/mathExt";
import { Colors } from '../common/colors';

/**
 * Consts
 */
const Consts = {
  LineWidth: 1
};

@Component
export default class Train extends Vue {
  private id: string = "";
  private trainCanvas: TrainCanvas;
  private mouseX: number = Number.MAX_SAFE_INTEGER;
  private mouseY: number = Number.MAX_SAFE_INTEGER;
  private isConnected = false;
  private cube: Cube = null;

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
    this.trainCanvas = new TrainCanvas(<HTMLCanvasElement>(
      document.getElementById("canvas")
    ), {
      lineWidth: 1,
      lineColor: Colors.Line,
      color: Colors.Canvas,
      startPointColor: Colors.StartPoint
    });
    this.mouseX = Number.MAX_SAFE_INTEGER;
    this.mouseY = Number.MAX_SAFE_INTEGER;
  }

  // Button Events

  onConnectClick() {
    this.startScan();
  }

  onStartClick() {
    console.log("onStartClick");
    this.start();
  }

  onClearClick() {
    this.trainCanvas.clear(false);
  }

  onDisconnectClick() {
    if (this.timerId !== Number.MAX_SAFE_INTEGER) {
      clearInterval(this.timerId);
    }
    if (!this.cube) {
      return;
    }
    this.cube.disconnect();
    this.cube = null;
    this.isConnected = false;
    this.nextPointIndex = 0;
    this.trainCanvas.clear(true);
    this.startPosition = null;
  }

  onChangeIdInformation(event: any) {
    let characteristic = event.target;
    this.currentPosition = new IdInformation(characteristic.value);
    if (!this.startPosition) {
      this.startPosition = this.currentPosition;
      this.trainCanvas.startPoint = {
        x: this.startPosition.positionX,
        y: this.startPosition.positionY
      }
    }
  }

  private async start() {
    await this.cube.playMelody(Melody.Haru);
    this.stopTimerId = setInterval(() => {
      if (this.nextPointIndex >= this.trainCanvas.drawPoints.length - 1) {
        const lastPoint = this.trainCanvas.drawPoints[this.trainCanvas.drawPoints.length - 1];
        const distance = MathExt.distance({
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: this.currentPosition.positionX,
          y2: this.currentPosition.positionY
        });

        if (distance <= 25) {
          clearInterval(this.timerId);
          clearInterval(this.stopTimerId);
          this.cube.stop();
          this.nextPointIndex = 0;
          this.trainCanvas.clear(true);
          this.startPosition = null;
        }
      }
    }, 15);

    this.timerId = setInterval(() => {
      if (this.nextPointIndex < this.trainCanvas.drawPoints.length - 1) {
        this.nextPointIndex++;
      }
      const nextPoint = this.trainCanvas.drawPoints[this.nextPointIndex];
      const chaseResult = this.chase(
        nextPoint.x,
        nextPoint.y,
        this.currentPosition.positionX,
        this.currentPosition.positionY,
        this.currentPosition.angle
      );
      this.cube.move(chaseResult[0], chaseResult[1]);
    }, 50);
  }

  private _clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
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
    const distance = MathExt.distance({
      x1: nextX,
      y1: nextY,
      x2: cubeX,
      y2: cubeY
    })
    let relAngle = MathExt.relativeAngle({
      x: cubeX,
      y: cubeY,
      angle: cubeAngle,
      targetX: nextX,
      targetY: nextY
    });

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
    this.cube = new Cube(device, {
      onChangePosition: (idInformation: IdInformation) => {
        if (!this.startPosition) {
          this.startPosition = this.currentPosition;
          this.trainCanvas.startPoint = {
            x: idInformation.positionX,
            y: idInformation.positionY.
          }
        }
      }
    });
    await this.cube.connect();
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