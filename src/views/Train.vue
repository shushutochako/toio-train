<template>
  <div class="container">
    <div class="cavasContainer">
      <canvas id="canvas" width="400" height="400"></canvas>
    </div>
    <div class="buttonContainer">
      <v-btn class="actionButton" color="success" @click="onConnectClick()" v-bind:disabled="isConnected">Connect</v-btn>
      <v-btn class="actionButton" color="success" @click="onStartClick()">Start</v-btn>
      <v-btn class="actionButton" color="success" @click="onDisconnectClick()" v-bind:disabled="!isConnected">Disconnect</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Context } from "mocha";
import { ServiceUUID, CharacteristicUUID } from "../common/uuids";

/**
 * Colors
 */
enum Colors {
  Canvas = '#e6e6e6',
  Line = '#555555'
}

/**
 * Consts
 */
const Consts = {
  LineWidth: 1,
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
  }

  onConnectClick() {
    this.startScan();
  }

  onDisconnectClick() {
    if (!this.cube) {
      return;
    }
    this.cube.gatt.disconnect();
    this.cube = null;
    this.isConnected = false;
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
    this.connect(device);
  }

  private async connect(device: BluetoothDevice) {
    const server = await device.gatt.connect();
    this.cube = device;
    this.isConnected = true;
    // cube = device;
    // const service = await server.getPrimaryService(SERVICE_UUID);
  }
}
</script>
<style scoped>
.container {
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