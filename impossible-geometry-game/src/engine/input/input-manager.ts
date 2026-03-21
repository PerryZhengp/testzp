import {
  Camera,
  Object3D,
  Raycaster,
  Vector2,
  type Intersection,
  type WebGLRenderer
} from 'three';
import type { HitTarget } from '../../shared/types/game';

export interface InputCallbacks {
  onTargetClick: (target: HitTarget) => void;
}

export class InputManager {
  private readonly raycaster = new Raycaster();

  private readonly pointer = new Vector2();

  private enabled = true;

  private pickables: Object3D[] = [];

  private callbacks: InputCallbacks;

  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly camera: Camera,
    callbacks: InputCallbacks
  ) {
    this.callbacks = callbacks;
    renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
  }

  setCallbacks(callbacks: InputCallbacks): void {
    this.callbacks = callbacks;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setPickables(objects: Object3D[]): void {
    this.pickables = objects;
  }

  dispose(): void {
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.enabled) {
      return;
    }

    const target = this.pick(event);
    if (!target) {
      return;
    }

    this.callbacks.onTargetClick(target);
  };

  private pick(event: PointerEvent): HitTarget | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    const first = this.firstHitWithUserData(hits);
    if (!first) {
      return null;
    }

    const kind = first.object.userData.pickKind;
    const id = first.object.userData.pickId;
    if ((kind !== 'node' && kind !== 'interactable') || typeof id !== 'string') {
      return null;
    }

    return { kind, id };
  }

  private firstHitWithUserData(hits: Intersection<Object3D>[]): Intersection<Object3D> | undefined {
    return hits.find((hit) => {
      const kind = hit.object.userData.pickKind;
      const id = hit.object.userData.pickId;
      return (kind === 'node' || kind === 'interactable') && typeof id === 'string';
    });
  }
}
