import type { WalkGraph } from '../../shared/types/game';
import type { Vec3 } from '../../shared/types/game';
import { vec3Distance, vec3Lerp } from '../../shared/utils/math';

export interface MovementUpdate {
  position: Vec3;
  reachedNodeId?: string;
  finished: boolean;
}

export class MovementSystem {
  private speedUnitsPerSecond: number;

  private path: string[] = [];

  private segmentIndex = 0;

  private position: Vec3 = [0, 0, 0];

  private moving = false;

  constructor(speedUnitsPerSecond = 2.2) {
    this.speedUnitsPerSecond = speedUnitsPerSecond;
  }

  setSpeed(speedUnitsPerSecond: number): void {
    this.speedUnitsPerSecond = speedUnitsPerSecond;
  }

  teleport(position: Vec3): void {
    this.path = [];
    this.segmentIndex = 0;
    this.position = [...position];
    this.moving = false;
  }

  begin(path: string[], graph: WalkGraph): void {
    if (path.length <= 1) {
      this.path = [];
      this.moving = false;
      return;
    }

    this.path = [...path];
    this.segmentIndex = 0;
    this.position = [...graph.nodes[path[0]].worldPosition];
    this.moving = true;
  }

  isMoving(): boolean {
    return this.moving;
  }

  getPosition(): Vec3 {
    return [...this.position];
  }

  update(deltaSeconds: number, graph: WalkGraph): MovementUpdate {
    if (!this.moving) {
      return {
        position: [...this.position],
        finished: true
      };
    }

    const fromId = this.path[this.segmentIndex];
    const toId = this.path[this.segmentIndex + 1];

    const fromNode = graph.nodes[fromId];
    const toNode = graph.nodes[toId];

    if (!fromNode || !toNode) {
      this.moving = false;
      return {
        position: [...this.position],
        finished: true
      };
    }

    const segmentDistance = vec3Distance(fromNode.worldPosition, toNode.worldPosition);
    if (segmentDistance <= Number.EPSILON) {
      this.segmentIndex += 1;
      this.position = [...toNode.worldPosition];
      const finished = this.segmentIndex >= this.path.length - 1;
      this.moving = !finished;
      return {
        position: [...this.position],
        reachedNodeId: toId,
        finished
      };
    }

    const distanceFromStart = vec3Distance(fromNode.worldPosition, this.position);
    const travel = this.speedUnitsPerSecond * deltaSeconds;
    const nextDistance = distanceFromStart + travel;

    if (nextDistance >= segmentDistance) {
      this.position = [...toNode.worldPosition];
      this.segmentIndex += 1;
      const finished = this.segmentIndex >= this.path.length - 1;
      this.moving = !finished;
      return {
        position: [...this.position],
        reachedNodeId: toId,
        finished
      };
    }

    const t = nextDistance / segmentDistance;
    this.position = vec3Lerp(fromNode.worldPosition, toNode.worldPosition, t);
    return {
      position: [...this.position],
      finished: false
    };
  }
}
