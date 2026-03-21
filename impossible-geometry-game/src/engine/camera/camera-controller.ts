import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import type { CameraDef } from '../../shared/types/game';

export class CameraController {
  readonly camera: OrthographicCamera;

  private width = 1;

  private height = 1;

  constructor() {
    this.camera = new OrthographicCamera(-6, 6, 6, -6, 0.1, 200);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
  }

  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const aspect = this.width / this.height;

    const frustumHeight = 12;
    this.camera.left = (-frustumHeight * aspect) / 2;
    this.camera.right = (frustumHeight * aspect) / 2;
    this.camera.top = frustumHeight / 2;
    this.camera.bottom = -frustumHeight / 2;
    this.camera.updateProjectionMatrix();
  }

  applyLevelCamera(def: CameraDef): void {
    const yawRad = MathUtils.degToRad(def.yawDeg);
    const pitchRad = MathUtils.degToRad(def.pitchDeg);
    const distance = Math.max(8, def.zoom * 2.4);

    const x = def.target[0] + distance * Math.cos(pitchRad) * Math.cos(yawRad);
    const y = def.target[1] + distance * Math.sin(pitchRad);
    const z = def.target[2] + distance * Math.cos(pitchRad) * Math.sin(yawRad);

    this.camera.position.set(x, y, z);
    this.camera.zoom = Math.max(0.5, def.zoom / 4.5);
    this.camera.lookAt(new Vector3(def.target[0], def.target[1], def.target[2]));
    this.camera.updateProjectionMatrix();
  }

  getAspect(): number {
    return this.width / this.height;
  }
}
