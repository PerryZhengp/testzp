import { OrthographicCamera, Vector3 } from 'three';
import type { Vec3 } from '../../shared/types/game';

function normalizeToSafeViewport(
  point: { x: number; y: number },
  aspect: number,
  safeAspect = 16 / 9
): { x: number; y: number } {
  if (aspect > safeAspect) {
    return {
      x: point.x * (safeAspect / aspect),
      y: point.y
    };
  }

  if (aspect < safeAspect) {
    return {
      x: point.x,
      y: point.y * (aspect / safeAspect)
    };
  }

  return point;
}

export function computeIllusoryDistanceNdc(
  from: Vec3,
  to: Vec3,
  camera: OrthographicCamera,
  aspect: number
): number {
  const fromProjected = new Vector3(from[0], from[1], from[2]).project(camera);
  const toProjected = new Vector3(to[0], to[1], to[2]).project(camera);

  const fromSafe = normalizeToSafeViewport({ x: fromProjected.x, y: fromProjected.y }, aspect);
  const toSafe = normalizeToSafeViewport({ x: toProjected.x, y: toProjected.y }, aspect);

  const dx = fromSafe.x - toSafe.x;
  const dy = fromSafe.y - toSafe.y;
  return Math.sqrt(dx * dx + dy * dy);
}
