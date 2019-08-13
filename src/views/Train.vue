<template>
  <div class="container">
    <div class="cavasContainer">
      <canvas id="canvas" width="400" height="400"></canvas>
    </div>
    <div class="buttonContainer">
      <button class="actionButton" type="button" onclick="onConnectClick()">Connect</button>
      <button class="actionButton" type="button" onclick="onStartClick()">Start</button>
      <button class="actionButton" type="button" onclick="onDisconnectClick()">Disconnect</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Context } from "mocha";

@Component
export default class Train extends Vue {
  private id: string = "";
  private points: Array<any> = [];
  private ctx!: CanvasRenderingContext2D;
  private mouseX: number = 0;
  private mouseY: number = 0;

  mounted(): void {
    //HTML上の canvas タグを取得
    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    console.log("mounted!!!!");

    this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    this.ctx.beginPath();
    this.ctx.fillStyle = "#f5f5f5";
    this.ctx.fillRect(0, 0, 410, 410);

    this.mouseX = 0;
    this.mouseY = 0;

    canvas.addEventListener("mousemove", this.onMove, false);
    canvas.addEventListener("mousedown", this.onClick, false);
    canvas.addEventListener("mouseup", this.drawEnd, false);
    canvas.addEventListener("mouseout", this.drawEnd, false);
  }

  onClick(e: any) {
    if (e.button === 0) {
      var rect = e.target.getBoundingClientRect();
      var X = ~~(e.clientX - rect.left);
      var Y = ~~(e.clientY - rect.top);
      //draw 関数にマウスの位置を渡す
      this.draw(X, Y);
    }
  }

  onMove(e:any) {
    if (e.buttons === 1 || e.witch === 1) {
      var rect = e.target.getBoundingClientRect();
      var X = ~~(e.clientX - rect.left);
      var Y = ~~(e.clientY - rect.top);
      this.draw(X, Y);
    }
  }

  draw(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.globalAlpha = 1.0;
    if (this.mouseX === null) {
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
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#555555";
    this.ctx.stroke();

    this.mouseX = x;
    this.mouseY = y;
  }

  drawEnd() {
    this.mouseX = 0;
    this.mouseY = 0;
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
  width: 100px;
  height: 50px;
}
</style>