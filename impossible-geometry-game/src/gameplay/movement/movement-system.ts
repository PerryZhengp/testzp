import type { WalkGraph } from '../../shared/types/game';
import type { Vec3 } from '../../shared/types/game';
import { vec3Distance, vec3Lerp } from '../../shared/utils/math';

export interface MovementUpdate {
  position: Vec3;
  reachedNodeId?: string;
  finished: boolean;
}

type MotionPhase = 'idle' | 'preTurn' | 'start' | 'cruise' | 'settle';

export class MovementSystem {
  private speedUnitsPerSecond: number;

  private path: string[] = [];

  private segmentIndex = 0;

  private position: Vec3 = [0, 0, 0];

  private settleBasePosition: Vec3 = [0, 0, 0];

  private moving = false;

  private phase: MotionPhase = 'idle';

  private phaseElapsedSeconds = 0;

  private phaseDurationSeconds = 0;

  private segmentDistance = 0;

  private startShare = 0.22;

  private stairFactor = 1;

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
    this.settleBasePosition = [...position];
    this.moving = false;
    this.phase = 'idle';
    this.phaseElapsedSeconds = 0;
    this.phaseDurationSeconds = 0;
    this.segmentDistance = 0;
    this.stairFactor = 1;
  }

  begin(path: string[], graph: WalkGraph): void {
    if (path.length <= 1) {
      this.path = [];
      this.moving = false;
      this.phase = 'idle';
      return;
    }

    this.path = [...path];
    this.segmentIndex = 0;
    this.position = [...graph.nodes[path[0]].worldPosition];
    this.settleBasePosition = [...this.position];
    this.moving = true;
    this.enterPreTurn(graph);
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
      this.phase = 'idle';
      return {
        position: [...this.position],
        finished: true
      };
    }

    this.phaseElapsedSeconds += deltaSeconds;

    if (this.phase === 'preTurn') {
      if (this.phaseElapsedSeconds >= this.phaseDurationSeconds) {
        this.enterStart(fromNode.worldPosition, toNode.worldPosition);
      }

      return {
        position: [...this.position],
        finished: false
      };
    }

    if (this.phase === 'start') {
      const t = Math.min(1, this.phaseElapsedSeconds / this.phaseDurationSeconds);
      const eased = easeOutCubic(t);
      const progress = this.startShare * eased;
      this.position = this.withBob(vec3Lerp(fromNode.worldPosition, toNode.worldPosition, progress), progress);

      if (t >= 1) {
        this.phase = 'cruise';
        this.phaseElapsedSeconds = 0;
        this.phaseDurationSeconds = this.resolveCruiseDuration();
      }

      return {
        position: [...this.position],
        finished: false
      };
    }

    if (this.phase === 'cruise') {
      const t = Math.min(1, this.phaseElapsedSeconds / this.phaseDurationSeconds);
      const progress = this.startShare + (1 - this.startShare) * t;
      this.position = this.withBob(vec3Lerp(fromNode.worldPosition, toNode.worldPosition, progress), progress);

      if (t >= 1) {
        this.position = [...toNode.worldPosition];
        this.segmentIndex += 1;
        const finishedPath = this.segmentIndex >= this.path.length - 1;
        if (finishedPath) {
          this.enterSettle();
          return {
            position: [...this.position],
            reachedNodeId: toId,
            finished: false
          };
        }

        this.enterPreTurn(graph);
        return {
          position: [...this.position],
          reachedNodeId: toId,
          finished: false
        };
      }

      return {
        position: [...this.position],
        finished: false
      };
    }

    if (this.phase === 'settle') {
      const t = Math.min(1, this.phaseElapsedSeconds / this.phaseDurationSeconds);
      const settleLift = Math.sin((1 - t) * Math.PI) * 0.01;
      this.position = [this.settleBasePosition[0], this.settleBasePosition[1] + settleLift, this.settleBasePosition[2]];

      if (t >= 1) {
        this.position = [...this.settleBasePosition];
        this.moving = false;
        this.phase = 'idle';
        return {
          position: [...this.position],
          finished: true
        };
      }

      return {
        position: [...this.position],
        finished: false
      };
    }

    return {
      position: [...this.position],
      finished: false
    };
  }

  private enterPreTurn(graph: WalkGraph): void {
    this.phase = 'preTurn';
    this.phaseElapsedSeconds = 0;
    this.phaseDurationSeconds = this.resolvePreTurnDuration(graph);
  }

  private enterStart(from: Vec3, to: Vec3): void {
    this.segmentDistance = Math.max(0.001, vec3Distance(from, to));
    const deltaY = Math.abs(to[1] - from[1]);
    this.stairFactor = deltaY > 0.06 ? 1.12 : 1;

    const baseSegmentDuration = this.segmentDistance / this.speedUnitsPerSecond;
    this.phase = 'start';
    this.phaseElapsedSeconds = 0;
    this.phaseDurationSeconds = clamp(baseSegmentDuration * 0.3, 0.12, 0.18);
    this.startShare = clamp(0.18 + baseSegmentDuration * 0.06, 0.18, 0.28);
  }

  private enterSettle(): void {
    this.phase = 'settle';
    this.phaseElapsedSeconds = 0;
    this.phaseDurationSeconds = 0.14;
    this.settleBasePosition = [...this.position];
  }

  private resolveCruiseDuration(): number {
    const total = this.segmentDistance / this.speedUnitsPerSecond;
    const remaining = Math.max(0.08, total * this.stairFactor - this.phaseDurationSeconds);
    return remaining;
  }

  private resolvePreTurnDuration(graph: WalkGraph): number {
    if (this.segmentIndex <= 0) {
      return 0.08;
    }

    const prevId = this.path[this.segmentIndex - 1];
    const currentId = this.path[this.segmentIndex];
    const nextId = this.path[this.segmentIndex + 1];
    const prev = graph.nodes[prevId];
    const current = graph.nodes[currentId];
    const next = graph.nodes[nextId];
    if (!prev || !current || !next) {
      return 0.09;
    }

    const inVec: Vec3 = [
      current.worldPosition[0] - prev.worldPosition[0],
      current.worldPosition[1] - prev.worldPosition[1],
      current.worldPosition[2] - prev.worldPosition[2]
    ];
    const outVec: Vec3 = [
      next.worldPosition[0] - current.worldPosition[0],
      next.worldPosition[1] - current.worldPosition[1],
      next.worldPosition[2] - current.worldPosition[2]
    ];

    const angleDeg = angleBetween(inVec, outVec);
    if (angleDeg > 105) {
      return 0.12;
    }
    if (angleDeg > 55) {
      return 0.1;
    }
    return 0.08;
  }

  private withBob(position: Vec3, progress: number): Vec3 {
    const bobScale = this.stairFactor > 1 ? 0.7 : 1;
    const bob = Math.sin(progress * Math.PI * 2) * 0.013 * bobScale;
    return [position[0], position[1] + Math.max(0, bob), position[2]];
  }
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function angleBetween(a: Vec3, b: Vec3): number {
  const magA = Math.hypot(a[0], a[1], a[2]);
  const magB = Math.hypot(b[0], b[1], b[2]);
  if (magA <= Number.EPSILON || magB <= Number.EPSILON) {
    return 0;
  }

  const dot = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (magA * magB);
  const clampedDot = clamp(dot, -1, 1);
  return (Math.acos(clampedDot) * 180) / Math.PI;
}
