import type { LevelDef, SaveDataV1 } from '../../shared/types/game';

export interface InteractablePanelItem {
  id: string;
  name: string;
  valueLabel: string;
}

export interface ReachableNodeItem {
  id: string;
  label: string;
}

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
  onInteractablePanel: (interactableId: string) => void;
  onMoveNodePanel: (nodeId: string) => void;
}

export interface GameUIOptions {
  debugMode?: boolean;
}

export class GameUI {
  private readonly shell: HTMLDivElement;

  private readonly mainMenu: HTMLDivElement;

  private readonly levelSelect: HTMLDivElement;

  private readonly levelSummary: HTMLDivElement;

  private readonly levelList: HTMLDivElement;

  private readonly hud: HTMLDivElement;

  private readonly hudTitle: HTMLDivElement;

  private readonly restartDock: HTMLDivElement;

  private readonly controlDock: HTMLDivElement;

  private readonly nodeList: HTMLDivElement;

  private readonly nodeEmpty: HTMLDivElement;

  private readonly nodeCount: HTMLDivElement;

  private readonly interactableList: HTMLDivElement;

  private readonly interactableEmpty: HTMLDivElement;

  private readonly interactableCount: HTMLDivElement;

  private readonly pauseScrim: HTMLDivElement;

  private readonly pauseDrawer: HTMLDivElement;

  private readonly completeOverlay: HTMLDivElement;

  private readonly completeTitle: HTMLDivElement;

  private readonly completeDescription: HTMLDivElement;

  private readonly nextLevelButton: HTMLButtonElement;

  private readonly settingsPanel: HTMLDivElement;

  private readonly hintBubble: HTMLDivElement;

  private readonly toast: HTMLDivElement;

  private readonly debugMode: boolean;

  private interactableEnabled = true;

  private nodeEnabled = true;

  private readonly nodeButtons = new Map<string, HTMLButtonElement>();

  private readonly interactableButtons = new Map<string, HTMLButtonElement>();

  constructor(container: HTMLElement, private readonly handlers: GameUIHandlers, options?: GameUIOptions) {
    this.debugMode = Boolean(options?.debugMode);
    this.shell = document.createElement('div');
    this.shell.className = 'ui-shell';

    this.mainMenu = document.createElement('div');
    this.mainMenu.className = 'landing-screen';
    this.mainMenu.innerHTML = `
      <div class="landing-aura" aria-hidden="true"></div>
      <div class="landing-showcase" aria-hidden="true">
        <img src="/landing-cover.svg" alt="" />
      </div>
      <div class="landing-project">Echoes of Geometry</div>
      <div class="landing-content">
        <h1>看见本不该存在的路</h1>
        <p>一款安静、克制的浏览器建筑解谜作品。</p>
      </div>
      <div class="landing-actions">
        <button data-action="start">开始旅程</button>
        <button data-action="level-select" class="ghost">选关目录</button>
      </div>
    `;

    this.levelSelect = document.createElement('div');
    this.levelSelect.className = 'level-select-screen hidden';
    this.levelSelect.innerHTML = `
      <div class="catalog-frame">
        <aside class="catalog-chapters">
          <div class="section-title">Chapters</div>
          <button class="chapter-row active" type="button" disabled>Chapter 01 · 浮空观象台</button>
          <button class="chapter-row" type="button" disabled>Chapter 02 · 开发中</button>
          <button class="chapter-row" type="button" disabled>Chapter 03 · 开发中</button>
        </aside>
        <section class="catalog-levels">
          <div class="catalog-head">
            <div class="section-title">Levels</div>
            <div class="level-select-meta"></div>
          </div>
          <div class="level-list"></div>
        </section>
      </div>
      <div class="button-row">
        <button data-action="back-main" class="ghost">返回首页</button>
      </div>
    `;
    this.levelSummary = this.levelSelect.querySelector('.level-select-meta') as HTMLDivElement;
    this.levelList = this.levelSelect.querySelector('.level-list') as HTMLDivElement;

    this.hud = document.createElement('div');
    this.hud.className = 'hud hidden';
    this.hud.innerHTML = `
      <div class="hud-title">Chapter 01 / -</div>
      <button data-action="pause" class="ghost">暂停</button>
    `;
    this.hudTitle = this.hud.querySelector('.hud-title') as HTMLDivElement;

    this.restartDock = document.createElement('div');
    this.restartDock.className = 'hud-restart hidden';
    this.restartDock.innerHTML = '<button data-action="reset" class="ghost">重置本关</button>';

    this.controlDock = document.createElement('div');
    this.controlDock.className = 'control-dock hidden';
    this.controlDock.innerHTML = `
      <div class="control-caption">可操作索引</div>
      <section class="control-group">
        <div class="control-group-head">
          <div class="group-title">可前往节点</div>
          <div class="group-count node-count">0</div>
        </div>
        <div class="node-list"></div>
        <div class="node-empty">暂无可达节点</div>
      </section>
      <section class="control-group">
        <div class="control-group-head">
          <div class="group-title">机关状态</div>
          <div class="group-count interactable-count">0</div>
        </div>
        <div class="interactable-list"></div>
        <div class="interactable-empty">本关无机关</div>
      </section>
    `;
    this.nodeList = this.controlDock.querySelector('.node-list') as HTMLDivElement;
    this.nodeEmpty = this.controlDock.querySelector('.node-empty') as HTMLDivElement;
    this.nodeCount = this.controlDock.querySelector('.node-count') as HTMLDivElement;
    this.interactableList = this.controlDock.querySelector('.interactable-list') as HTMLDivElement;
    this.interactableEmpty = this.controlDock.querySelector('.interactable-empty') as HTMLDivElement;
    this.interactableCount = this.controlDock.querySelector('.interactable-count') as HTMLDivElement;

    this.pauseScrim = document.createElement('div');
    this.pauseScrim.className = 'pause-scrim hidden';

    this.pauseDrawer = document.createElement('div');
    this.pauseDrawer.className = 'pause-drawer hidden';
    this.pauseDrawer.innerHTML = `
      <h2>暂停</h2>
      <button data-action="resume" class="text-action">继续</button>
      <button data-action="reset" class="text-action">重置本关</button>
      <button data-action="back-levels" class="text-action">返回选关</button>
      <button data-action="settings" class="text-action">设置</button>
      <button data-action="back-main" class="text-action">退出到首页</button>
    `;

    this.completeOverlay = document.createElement('div');
    this.completeOverlay.className = 'complete-screen hidden';
    this.completeOverlay.innerHTML = `
      <h2>Completed</h2>
      <div class="complete-title"></div>
      <div class="complete-desc"></div>
      <div class="button-row">
        <button data-action="next-level">下一关</button>
        <button data-action="back-levels" class="ghost">返回选关</button>
      </div>
    `;
    this.completeTitle = this.completeOverlay.querySelector('.complete-title') as HTMLDivElement;
    this.completeDescription = this.completeOverlay.querySelector('.complete-desc') as HTMLDivElement;
    this.nextLevelButton = this.completeOverlay.querySelector(
      '[data-action="next-level"]'
    ) as HTMLButtonElement;

    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'settings-screen hidden';
    this.settingsPanel.innerHTML = `
      <div class="settings-shell">
        <aside class="settings-nav">
          <h2>Settings</h2>
          <button type="button" class="settings-nav-item active" disabled>Audio</button>
          <button type="button" class="settings-nav-item" disabled>Display</button>
          <button type="button" class="settings-nav-item" disabled>Accessibility</button>
          <button type="button" class="settings-nav-item" disabled>Language</button>
        </aside>
        <section class="settings-controls">
          <label>
            主音量
            <input data-setting="masterVolume" type="range" min="0" max="1" step="0.01" />
          </label>
          <label>
            音乐音量
            <input data-setting="musicVolume" type="range" min="0" max="1" step="0.01" />
          </label>
          <label>
            音效音量
            <input data-setting="sfxVolume" type="range" min="0" max="1" step="0.01" />
          </label>
          <label class="checkbox-row">
            <span>低动态效果</span>
            <input data-setting="reducedMotion" type="checkbox" />
          </label>
          <label>
            语言
            <select data-setting="language">
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </label>
          <div class="button-row">
            <button data-action="close-settings">完成</button>
          </div>
        </section>
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
      this.restartDock,
      this.controlDock,
      this.pauseScrim,
      this.pauseDrawer,
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
    this.restartDock.classList.add('hidden');
    this.controlDock.classList.add('hidden');
    this.pauseScrim.classList.add('hidden');
    this.pauseDrawer.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.settingsPanel.classList.add('hidden');
    this.hideHint();
  }

  showLevelSelect(levels: LevelDef[], unlocked: Set<string>, completed: Set<string>): void {
    this.showOnly(this.levelSelect);
    this.hud.classList.add('hidden');
    this.restartDock.classList.add('hidden');
    this.controlDock.classList.add('hidden');
    this.pauseScrim.classList.add('hidden');
    this.pauseDrawer.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');

    this.levelList.replaceChildren();
    this.levelSummary.textContent = `已解锁 ${unlocked.size}/${levels.length} · 已完成 ${completed.size}/${levels.length}`;

    for (const [index, level] of levels.entries()) {
      const row = document.createElement('button');
      const open = unlocked.has(level.id);
      const done = completed.has(level.id);
      const status = !open ? '未解锁' : done ? '已完成' : '可进入';

      row.className = `level-row ${open ? 'open' : 'locked'} ${done ? 'done' : ''}`;
      row.disabled = !open;
      row.innerHTML = `
        <span class="row-index">${String(index + 1).padStart(2, '0')}</span>
        <span class="row-title">${level.title}</span>
        <span class="row-state">${status}</span>
      `;

      if (open) {
        row.addEventListener('click', () => this.handlers.onSelectLevel(level.id));
      }

      this.levelList.append(row);
    }
  }

  showPlaying(levelTitle: string): void {
    this.mainMenu.classList.add('hidden');
    this.levelSelect.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.restartDock.classList.remove('hidden');
    this.controlDock.classList.toggle('hidden', !this.debugMode);
    this.pauseScrim.classList.add('hidden');
    this.pauseDrawer.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.hudTitle.textContent = `Chapter 01 / ${levelTitle}`;
    this.setPaused(false);
  }

  setPaused(paused: boolean): void {
    this.pauseScrim.classList.toggle('hidden', !paused);
    this.pauseDrawer.classList.toggle('hidden', !paused);
    this.controlDock.classList.toggle('is-paused', paused && this.debugMode);
    const pauseButton = this.hud.querySelector('[data-action="pause"]') as HTMLButtonElement;
    pauseButton.textContent = paused ? '继续' : '暂停';
  }

  showCompletion(levelTitle: string, hasNext: boolean): void {
    this.completeTitle.textContent = levelTitle;
    this.completeDescription.textContent = hasNext ? '下一关已解锁。' : '你已完成第一章。';
    this.completeOverlay.classList.remove('hidden');
    this.nextLevelButton.disabled = !hasNext;
    this.nextLevelButton.textContent = hasNext ? '下一关' : '已是最终关';
  }

  hideCompletion(): void {
    this.completeOverlay.classList.add('hidden');
  }

  updateReachableNodes(items: ReachableNodeItem[]): void {
    this.nodeButtons.clear();
    this.nodeList.replaceChildren();
    this.nodeCount.textContent = String(items.length);

    const hasItems = items.length > 0;
    this.nodeList.classList.toggle('hidden', !hasItems);
    this.nodeEmpty.classList.toggle('hidden', hasItems);

    if (!hasItems) {
      return;
    }

    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'dock-row node-row';
      button.dataset.nodeId = item.id;
      button.innerHTML = `
        <span class="dock-main">${item.label}</span>
        <span class="dock-meta">前往</span>
      `;
      button.disabled = !this.nodeEnabled;
      this.nodeButtons.set(item.id, button);
      this.nodeList.append(button);
    }
  }

  setNodeEnabled(enabled: boolean): void {
    this.nodeEnabled = enabled;
    for (const button of this.nodeButtons.values()) {
      button.disabled = !enabled;
    }
  }

  updateInteractables(items: InteractablePanelItem[]): void {
    this.interactableButtons.clear();
    this.interactableList.replaceChildren();
    this.interactableCount.textContent = String(items.length);

    const hasItems = items.length > 0;
    this.interactableList.classList.toggle('hidden', !hasItems);
    this.interactableEmpty.classList.toggle('hidden', hasItems);

    if (!hasItems) {
      return;
    }

    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'dock-row interactable-row';
      button.dataset.interactableId = item.id;
      button.innerHTML = `
        <span class="dock-main">${item.name}</span>
        <span class="dock-value">${item.valueLabel}</span>
      `;
      button.disabled = !this.interactableEnabled;
      this.interactableButtons.set(item.id, button);
      this.interactableList.append(button);
    }
  }

  setInteractableEnabled(enabled: boolean): void {
    this.interactableEnabled = enabled;
    for (const button of this.interactableButtons.values()) {
      button.disabled = !enabled;
    }
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
    }, 1600);
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

    this.mainMenu.querySelector('[data-action="level-select"]')?.addEventListener('click', () => {
      this.handlers.onStartJourney();
    });

    this.levelSelect.querySelector('[data-action="back-main"]')?.addEventListener('click', () => {
      this.handlers.onBackToMainMenu();
    });

    this.hud.querySelector('[data-action="pause"]')?.addEventListener('click', () => {
      this.handlers.onTogglePause();
    });

    this.restartDock.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.handlers.onResetLevel();
    });

    this.pauseDrawer.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      this.handlers.onTogglePause();
    });

    this.pauseDrawer.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.handlers.onResetLevel();
    });

    this.pauseDrawer.querySelector('[data-action="back-levels"]')?.addEventListener('click', () => {
      this.handlers.onBackToLevelSelect();
    });

    this.pauseDrawer.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.handlers.onOpenSettings();
    });

    this.pauseDrawer.querySelector('[data-action="back-main"]')?.addEventListener('click', () => {
      this.handlers.onBackToMainMenu();
    });

    this.pauseScrim.addEventListener('click', () => {
      this.handlers.onTogglePause();
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

    this.nodeList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-node-id]');
      if (!button || button.disabled) {
        return;
      }

      const nodeId = button.dataset.nodeId;
      if (!nodeId) {
        return;
      }

      this.handlers.onMoveNodePanel(nodeId);
    });

    this.interactableList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const button = target.closest<HTMLButtonElement>('button[data-interactable-id]');
      if (!button || button.disabled) {
        return;
      }

      const interactableId = button.dataset.interactableId;
      if (!interactableId) {
        return;
      }

      this.handlers.onInteractablePanel(interactableId);
    });

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
