// @vitest-environment jsdom
import { OrthographicCamera } from 'three';
import { level2 } from '../../src/content/levels/level-2';
import { level3 } from '../../src/content/levels/level-3';
import { LevelRuntime } from '../../src/gameplay/level/level-runtime';
import { findPath } from '../../src/gameplay/pathfinding/a-star-pathfinder';
import { SaveService } from '../../src/services/save/save-service';
import { orderedLevels } from '../../src/content/levels';

function createStorageMock(): Storage {
  const storage = new Map<string, string>();
  return {
    get length() {
      return storage.size;
    },
    clear() {
      storage.clear();
    },
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(storage.keys())[index] ?? null;
    },
    removeItem(key: string) {
      storage.delete(key);
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    }
  };
}

function createCamera(): OrthographicCamera {
  const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return camera;
}

describe('runtime flow', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createStorageMock()
    });
  });

  it('updates reachability after interactable state changes', () => {
    const runtime = new LevelRuntime(level2);
    const camera = createCamera();

    runtime.rebuild(camera, 16 / 9);
    expect(findPath(runtime.graph, level2.spawnNodeId, level2.goalNodeId)).toBeNull();

    runtime.setInteractableValue('rotatorA', 90);
    runtime.rebuild(camera, 16 / 9);
    expect(findPath(runtime.graph, level2.spawnNodeId, level2.goalNodeId)).not.toBeNull();
  });

  it('reset restores initial state for all interactables', () => {
    const runtime = new LevelRuntime(level3);
    const camera = createCamera();
    runtime.rebuild(camera, 16 / 9);

    runtime.setInteractableValue('slideBridge', 'center');
    runtime.setInteractableValue('liftBridge', 'up');
    runtime.setInteractableValue('rotateGoal', 90);
    runtime.reset();
    runtime.rebuild(camera, 16 / 9);

    expect(runtime.getInteractableValue('slideBridge')).toBe('left');
    expect(runtime.getInteractableValue('liftBridge')).toBe('down');
    expect(runtime.getInteractableValue('rotateGoal')).toBe(0);
  });

  it('persists unlock chain after completion', () => {
    const save = new SaveService(orderedLevels[0].id);
    save.load();
    save.markCompleted(orderedLevels[0].id);
    save.unlockLevel(orderedLevels[1].id);

    const restored = new SaveService(orderedLevels[0].id).load();
    expect(restored.completedLevelIds).toContain(orderedLevels[0].id);
    expect(restored.unlockedLevelIds).toContain(orderedLevels[1].id);
  });
});
