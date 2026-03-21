// @vitest-environment jsdom
import { SaveService } from '../../src/services/save/save-service';

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

describe('SaveService', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: createStorageMock()
    });
  });

  it('loads default save and keeps first level unlocked', () => {
    const service = new SaveService('chapter1-level1');
    const save = service.load();
    expect(save.unlockedLevelIds).toContain('chapter1-level1');
    expect(save.version).toBe(1);
  });

  it('persists completed/unlocked levels', () => {
    const service = new SaveService('chapter1-level1');
    service.load();
    service.markCompleted('chapter1-level1');
    service.unlockLevel('chapter1-level2');

    const second = new SaveService('chapter1-level1');
    const loaded = second.load();
    expect(loaded.completedLevelIds).toContain('chapter1-level1');
    expect(loaded.unlockedLevelIds).toContain('chapter1-level2');
  });
});
