import { IdInformation } from './idInformation';
import { ServiceUUID, CharacteristicUUID } from "./uuids";
import { Melody } from "./melodies";

/**
 * Cube
 */
export class Cube {

  private device: BluetoothDevice;
  private motorControl: any = null;
  private soundControl: any = null;
  private currentPosition!: IdInformation;
  private callbacks: Cube.Callbacks;

  constructor(scanned: BluetoothDevice, callbacks: Cube.Callbacks) {
    this.device = scanned;
    this.callbacks = callbacks;
  }

  async connect() {
    const server = await this.device.gatt.connect();
    // this.isConnected = true;
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

  disconnect() {
    this.device.gatt.disconnect();
  }

  move(left: number, right: number) {
    const data = this.motorData(left, right);
    this.motorControl.writeValue(data);
  }

  stop() {
    this.motorControl.writeValue(Uint8Array.from([1, 1, 1, 0, 2, 1, 0]));
  }

  playMelody(melody: Melody) {
    // wait for playback to finish.
    return new Promise((resolve, reject) => {
      const volume = 255;
      const data = this.genMelodyData(melody, volume);
      this.soundControl.writeValue(Uint8Array.from(data));
      setTimeout(() => {
        resolve();
      }, Melody.playTimeMillisec(melody) + 500); // 500 is blank
    });
  }

  private motorData(left: number, right: number): Uint8Array {
    const lSign = left > 0 ? 1 : -1;
    const rSign = right > 0 ? 1 : -1;
    const lDirection = left > 0 ? 1 : 2;
    const rDirection = right > 0 ? 1 : 2;
    const lPower = Math.min(Math.abs(left), 100);
    const rPower = Math.min(Math.abs(right), 100);
    return Uint8Array.from([1, 1, lDirection, lPower, 2, rDirection, rPower])
  }

  private onChangeIdInformation(event: any) {
    const characteristic = event.target;
    this.currentPosition = new IdInformation(characteristic.value);
    if (this.callbacks.onChangePosition) {
      this.callbacks.onChangePosition(this.currentPosition);
    }
  }

  private genMelodyData(melody: Melody, volume: number): Array<number> {
    const melodyOperations = Melody.operations(melody);
    const data = [3, 1, melodyOperations.length];
    melodyOperations.forEach((elm, i) => {
      if (i % 2 == 0) {
        data.push(elm.durationMs);
      } else {
        data.push(elm.noteName);
        data.push(volume);
      }
    });
    return data;
  }
}

export namespace Cube {
  export type Callbacks = {
    onChangePosition: (position: IdInformation) => void;
  };
}