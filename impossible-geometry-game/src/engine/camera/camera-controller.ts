import { MathUtils, OrthographicCamera, Vector3 } from 'three';
import type { CameraDef, Vec3 } from '../../shared/types/game';

export class CameraController {
  readonly camera: OrthographicCamera;

  private width = 1;

  private height = 1;

  private sideDockReserved = false;

  private readonly lookTarget = new Vector3();

  private readonly rightAxis = new Vector3();

  private readonly reusablePoint = new Vector3();

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

  setSideDockReserved(reserved: boolean): void {
    this.sideDockReserved = reserved;
  }

  applyLevelCamera(def: CameraDef, fitPoints?: Vec3[]): void {
    const aspect = this.width / this.height;
    const reserveRatio = aspect > 1.2 && this.sideDockReserved ? 0.14 : 0;
    const baseZoom = Math.max(0.45, def.zoom / 4.5);
    const focusPoint = this.buildFocusPoint(def, fitPoints);

    this.lookTarget.set(focusPoint[0], focusPoint[1], focusPoint[2]);
    this.applyPose(def, this.lookTarget);
    this.camera.zoom = baseZoom;
    this.camera.updateProjectionMatrix();

    if (fitPoints && fitPoints.length > 1) {
      this.fitViewToPoints(def, fitPoints, reserveRatio, baseZoom);
    } else {
      this.applyDockBias(def, reserveRatio);
    }
    this.camera.updateProjectionMatrix();
  }

  private applyPose(def: CameraDef, target: Vector3): void {
    const yawRad = MathUtils.degToRad(def.yawDeg);
    const pitchRad = MathUtils.degToRad(def.pitchDeg);
    const distance = Math.max(8, def.zoom * 2.4);

    this.camera.position.set(
      target.x + distance * Math.cos(pitchRad) * Math.cos(yawRad),
      target.y + distance * Math.sin(pitchRad),
      target.z + distance * Math.cos(pitchRad) * Math.sin(yawRad)
    );
    this.camera.lookAt(target);
    this.camera.updateMatrixWorld(true);
    this.camera.updateProjectionMatrix();
  }

  private buildFocusPoint(def: CameraDef, fitPoints?: Vec3[]): Vec3 {
    if (!fitPoints || fitPoints.length === 0) {
      return def.target;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (const [x, , z] of fitPoints) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    return [(minX + maxX) * 0.5, def.target[1], (minZ + maxZ) * 0.5];
  }

  private fitViewToPoints(def: CameraDef, points: Vec3[], reserveRatio: number, baseZoom: number): void {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const worldPadding = 0.58;

    for (const [x, y, z] of points) {
      this.reusablePoint.set(x, y, z).applyMatrix4(this.camera.matrixWorldInverse);
      minX = Math.min(minX, this.reusablePoint.x);
      maxX = Math.max(maxX, this.reusablePoint.x);
      minY = Math.min(minY, this.reusablePoint.y);
      maxY = Math.max(maxY, this.reusablePoint.y);
    }

    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
      this.applyDockBias(def, reserveRatio);
      return;
    }

    minX -= worldPadding;
    maxX += worldPadding;
    minY -= worldPadding;
    maxY += worldPadding;

    const spanX = Math.max(0.001, maxX - minX);
    const spanY = Math.max(0.001, maxY - minY);
    const frustumWidth = this.camera.right - this.camera.left;
    const frustumHeight = this.camera.top - this.camera.bottom;
    const usableWidthFactor = Math.max(0.52, 1 - reserveRatio);

    const fitZoomX = (frustumWidth * usableWidthFactor) / spanX;
    const fitZoomY = (frustumHeight * 0.97) / spanY;
    const fitZoom = Math.max(0.36, Math.min(baseZoom, fitZoomX, fitZoomY) * 0.95);
    this.camera.zoom = fitZoom;
    this.camera.updateProjectionMatrix();

    if (reserveRatio <= 0) {
      return;
    }

    const visibleWidth = frustumWidth / this.camera.zoom;
    const reservedWidth = visibleWidth * reserveRatio;
    const desiredCenterX = -reservedWidth * 0.5;
    const currentCenterX = (minX + maxX) * 0.5;
    const shiftWorld = currentCenterX - desiredCenterX;
    if (Math.abs(shiftWorld) < 0.0001) {
      return;
    }

    this.rightAxis.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.lookTarget.addScaledVector(this.rightAxis, shiftWorld);
    this.applyPose(def, this.lookTarget);
    this.camera.zoom = fitZoom;
    this.camera.updateProjectionMatrix();
  }

  private applyDockBias(def: CameraDef, reserveRatio: number): void {
    if (reserveRatio <= 0) {
      return;
    }

    const frustumWidth = this.camera.right - this.camera.left;
    const visibleWidth = frustumWidth / this.camera.zoom;
    const reservedWidth = visibleWidth * reserveRatio;
    const bias = Math.min(1.4, reservedWidth * 0.42);
    this.rightAxis.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.lookTarget.addScaledVector(this.rightAxis, bias);
    this.applyPose(def, this.lookTarget);
  }

  getAspect(): number {
    return this.width / this.height;
  }
}
