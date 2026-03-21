import type { LevelDef, SaveDataV1 } from '../../shared/types/game';

export interface GameUIHandlers {
  onStartJourney: () => void;
  onSelectLevel: (levelId: string) => void;
  onTogglePause: () => void;
  onResetLevel: () => void;
  onBackToLevelSelect: () => void;
  onBackToMainMenu: () => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  onSettingPatch: (patch: Partial<SaveDataV1['settings']>) => void;
  onNextLevel: () => void;
}

export class GameUI {
  private readonly shell: HTMLDivElement;

  private readonly mainMenu: HTMLDivElement;

  private readonly levelSelect: HTMLDivElement;

  private readonly levelGrid: HTMLDivElement;

  private readonly hud: HTMLDivElement;

  private readonly hudTitle: HTMLDivElement;

  private readonly pauseOverlay: HTMLDivElement;

  private readonly completeOverlay: HTMLDivElement;

  private readonly completeTitle: HTMLDivElement;

  private readonly nextLevelButton: HTMLButtonElement;

  private readonly settingsPanel: HTMLDivElement;

  private readonly hintBubble: HTMLDivElement;

  private readonly toast: HTMLDivElement;

  constructor(container: HTMLElement, private readonly handlers: GameUIHandlers) {
    this.shell = document.createElement('div');
    this.shell.className = 'ui-shell';

    this.mainMenu = document.createElement('div');
    this.mainMenu.className = 'panel main-menu';
    this.mainMenu.innerHTML = `
      <h1>Impossible Geometry</h1>
      <p>Manipulate impossible structures and reveal hidden paths.</p>
      <div class="button-row">
        <button data-action="start">Start Journey</button>
        <button data-action="settings" class="ghost">Settings</button>
      </div>
    `;

    this.levelSelect = document.createElement('div');
    this.levelSelect.className = 'panel level-select hidden';
    this.levelSelect.innerHTML = `
      <h2>Chapter I: Floating Observatory</h2>
      <p>Select an unlocked level.</p>
      <div class="level-grid"></div>
      <div class="button-row">
        <button data-action="back-main" class="ghost">Back</button>
      </div>
    `;
    this.levelGrid = this.levelSelect.querySelector('.level-grid') as HTMLDivElement;

    this.hud = document.createElement('div');
    this.hud.className = 'hud hidden';
    this.hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-title">-</div>
      </div>
      <div class="hud-right">
        <button data-action="pause">Pause</button>
        <button data-action="reset" class="ghost">Reset</button>
        <button data-action="back-levels" class="ghost">Levels</button>
        <button data-action="settings" class="ghost">Settings</button>
      </div>
    `;
    this.hudTitle = this.hud.querySelector('.hud-title') as HTMLDivElement;

    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.className = 'panel pause-overlay hidden';
    this.pauseOverlay.innerHTML = `
      <h2>Paused</h2>
      <div class="button-row">
        <button data-action="resume">Resume</button>
        <button data-action="reset" class="ghost">Reset Level</button>
        <button data-action="back-levels" class="ghost">Back to Levels</button>
      </div>
    `;

    this.completeOverlay = document.createElement('div');
    this.completeOverlay.className = 'panel complete-overlay hidden';
    this.completeOverlay.innerHTML = `
      <h2>Level Completed</h2>
      <div class="complete-title"></div>
      <div class="button-row">
        <button data-action="next-level">Next Level</button>
        <button data-action="back-levels" class="ghost">Level Select</button>
      </div>
    `;
    this.completeTitle = this.completeOverlay.querySelector('.complete-title') as HTMLDivElement;
    this.nextLevelButton = this.completeOverlay.querySelector(
      '[data-action="next-level"]'
    ) as HTMLButtonElement;

    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'panel settings-panel hidden';
    this.settingsPanel.innerHTML = `
      <h2>Settings</h2>
      <label>
        Master Volume
        <input data-setting="masterVolume" type="range" min="0" max="1" step="0.01" />
      </label>
      <label>
        Music Volume
        <input data-setting="musicVolume" type="range" min="0" max="1" step="0.01" />
      </label>
      <label>
        SFX Volume
        <input data-setting="sfxVolume" type="range" min="0" max="1" step="0.01" />
      </label>
      <label class="checkbox">
        <input data-setting="reducedMotion" type="checkbox" />
        Reduced Motion
      </label>
      <label>
        Language
        <select data-setting="language">
          <option value="zh-CN">简体中文</option>
          <option value="en">English</option>
        </select>
      </label>
      <div class="button-row">
        <button data-action="close-settings">Close</button>
      </div>
    `;

    this.hintBubble = document.createElement('div');
    this.hintBubble.className = 'hint-bubble hidden';

    this.toast = document.createElement('div');
    this.toast.className = 'toast hidden';

    this.shell.append(
      this.mainMenu,
      this.levelSelect,
      this.hud,
      this.pauseOverlay,
      this.completeOverlay,
      this.settingsPanel,
      this.hintBubble,
      this.toast
    );
    container.append(this.shell);

    this.bindEvents();
  }

  showMainMenu(): void {
    this.showOnly(this.mainMenu);
    this.hud.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.hideHint();
  }

  showLevelSelect(levels: LevelDef[], unlocked: Set<string>, completed: Set<string>): void {
    this.showOnly(this.levelSelect);
    this.hud.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');

    this.levelGrid.replaceChildren();

    for (const level of levels) {
      const button = document.createElement('button');
      const open = unlocked.has(level.id);
      button.className = `level-card ${open ? 'open' : 'locked'}`;
      button.disabled = !open;

      const done = completed.has(level.id) ? ' ✓' : '';
      button.innerHTML = `<strong>${level.title}${done}</strong><span>${level.description}</span>`;

      if (open) {
        button.addEventListener('click', () => this.handlers.onSelectLevel(level.id));
      }

      this.levelGrid.append(button);
    }
  }

  showPlaying(levelTitle: string): void {
    this.mainMenu.classList.add('hidden');
    this.levelSelect.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.hudTitle.textContent = levelTitle;
    this.setPaused(false);
  }

  setPaused(paused: boolean): void {
    this.pauseOverlay.classList.toggle('hidden', !paused);
    const pauseButton = this.hud.querySelector('[data-action="pause"]') as HTMLButtonElement;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
  }

  showCompletion(levelTitle: string, hasNext: boolean): void {
    this.completeTitle.textContent = levelTitle;
    this.completeOverlay.classList.remove('hidden');
    this.nextLevelButton.disabled = !hasNext;
    this.nextLevelButton.textContent = hasNext ? 'Next Level' : 'Chapter Complete';
  }

  hideCompletion(): void {
    this.completeOverlay.classList.add('hidden');
  }

  showSettings(): void {
    this.settingsPanel.classList.remove('hidden');
  }

  hideSettings(): void {
    this.settingsPanel.classList.add('hidden');
  }

  updateSettings(settings: SaveDataV1['settings']): void {
    this.setSettingValue('masterVolume', String(settings.masterVolume));
    this.setSettingValue('musicVolume', String(settings.musicVolume));
    this.setSettingValue('sfxVolume', String(settings.sfxVolume));
    this.setSettingValue('language', settings.language);

    const reducedMotion = this.settingsPanel.querySelector(
      '[data-setting="reducedMotion"]'
    ) as HTMLInputElement;
    reducedMotion.checked = settings.reducedMotion;
  }

  showHint(text: string): void {
    this.hintBubble.textContent = text;
    this.hintBubble.classList.remove('hidden');
  }

  hideHint(): void {
    this.hintBubble.classList.add('hidden');
  }

  notify(message: string): void {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');

    setTimeout(() => {
      this.toast.classList.add('hidden');
    }, 1500);
  }

  private showOnly(screen: HTMLElement): void {
    for (const panel of [this.mainMenu, this.levelSelect]) {
      panel.classList.toggle('hidden', panel !== screen);
    }
  }

  private setSettingValue(key: string, value: string): void {
    const input = this.settingsPanel.querySelector(`[data-setting="${key}"]`) as
      | HTMLInputElement
      | HTMLSelectElement
      | null;

    if (!input) {
      return;
    }

    if (input instanceof HTMLInputElement && input.type === 'checkbox') {
      input.checked = value === 'true';
      return;
    }

    input.value = value;
  }

  private bindEvents(): void {
    this.mainMenu.querySelector('[data-action="start"]')?.addEventListener('click', () => {
      this.handlers.onStartJourney();
    });

    this.mainMenu.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.handlers.onOpenSettings();
    });

    this.levelSelect.querySelector('[data-action="back-main"]')?.addEventListener('click', () => {
      this.handlers.onBackToMainMenu();
    });

    this.hud.querySelector('[data-action="pause"]')?.addEventListener('click', () => {
      this.handlers.onTogglePause();
    });

    this.hud.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.handlers.onResetLevel();
    });

    this.hud.querySelector('[data-action="back-levels"]')?.addEventListener('click', () => {
      this.handlers.onBackToLevelSelect();
    });

    this.hud.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.handlers.onOpenSettings();
    });

    this.pauseOverlay.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      this.handlers.onTogglePause();
    });

    this.pauseOverlay.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.handlers.onResetLevel();
    });

    this.pauseOverlay.querySelector('[data-action="back-levels"]')?.addEventListener('click', () => {
      this.handlers.onBackToLevelSelect();
    });

    this.completeOverlay
      .querySelector('[data-action="next-level"]')
      ?.addEventListener('click', () => {
        this.handlers.onNextLevel();
      });

    this.completeOverlay
      .querySelector('[data-action="back-levels"]')
      ?.addEventListener('click', () => {
        this.handlers.onBackToLevelSelect();
      });

    this.settingsPanel
      .querySelector('[data-action="close-settings"]')
      ?.addEventListener('click', () => this.handlers.onCloseSettings());

    const numericKeys: Array<
      keyof Pick<SaveDataV1['settings'], 'masterVolume' | 'musicVolume' | 'sfxVolume'>
    > = ['masterVolume', 'musicVolume', 'sfxVolume'];

    for (const key of numericKeys) {
      this.settingsPanel
        .querySelector(`[data-setting="${key}"]`)
        ?.addEventListener('input', (event) => {
          const target = event.currentTarget as HTMLInputElement;
          this.handlers.onSettingPatch({ [key]: Number(target.value) });
        });
    }

    this.settingsPanel
      .querySelector('[data-setting="language"]')
      ?.addEventListener('change', (event) => {
        const target = event.currentTarget as HTMLSelectElement;
        this.handlers.onSettingPatch({ language: target.value === 'en' ? 'en' : 'zh-CN' });
      });

    this.settingsPanel
      .querySelector('[data-setting="reducedMotion"]')
      ?.addEventListener('change', (event) => {
        const target = event.currentTarget as HTMLInputElement;
        this.handlers.onSettingPatch({ reducedMotion: target.checked });
      });
  }
}
