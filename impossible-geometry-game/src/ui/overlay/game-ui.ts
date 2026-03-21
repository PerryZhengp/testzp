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

export class GameUI {
  private readonly shell: HTMLDivElement;

  private readonly mainMenu: HTMLDivElement;

  private readonly levelSelect: HTMLDivElement;

  private readonly levelSummary: HTMLDivElement;

  private readonly levelGrid: HTMLDivElement;

  private readonly hud: HTMLDivElement;

  private readonly hudTitle: HTMLDivElement;

  private readonly hudSubtitle: HTMLDivElement;

  private readonly controlDeck: HTMLDivElement;

  private readonly nodeList: HTMLDivElement;

  private readonly nodeEmpty: HTMLDivElement;

  private readonly interactableList: HTMLDivElement;

  private readonly interactableEmpty: HTMLDivElement;

  private readonly pauseOverlay: HTMLDivElement;

  private readonly completeOverlay: HTMLDivElement;

  private readonly completeTitle: HTMLDivElement;

  private readonly completeDescription: HTMLDivElement;

  private readonly nextLevelButton: HTMLButtonElement;

  private readonly settingsPanel: HTMLDivElement;

  private readonly hintBubble: HTMLDivElement;

  private readonly toast: HTMLDivElement;

  private interactableEnabled = true;

  private nodeEnabled = true;

  private readonly nodeButtons = new Map<string, HTMLButtonElement>();

  private readonly interactableButtons = new Map<string, HTMLButtonElement>();

  constructor(container: HTMLElement, private readonly handlers: GameUIHandlers) {
    this.shell = document.createElement('div');
    this.shell.className = 'ui-shell';

    this.mainMenu = document.createElement('div');
    this.mainMenu.className = 'panel main-menu';
    this.mainMenu.innerHTML = `
      <div class="menu-kicker">UNFOLD THE IMPOSSIBLE</div>
      <h1>不可能几何</h1>
      <p>把空间当作机关来调度。你不只是解谜者，也是建筑系统的操控者。</p>
      <div class="button-row">
        <button data-action="start">开始旅程</button>
        <button data-action="settings" class="ghost">系统设置</button>
      </div>
      <div class="menu-footnote">新交互：关内可直接在“机关控制台”切换机关状态。</div>
    `;

    this.levelSelect = document.createElement('div');
    this.levelSelect.className = 'panel level-select hidden';
    this.levelSelect.innerHTML = `
      <h2>第一章：浮空观象台</h2>
      <p>建议按顺序挑战。后段关卡需要中途改态与多机关联动。</p>
      <div class="level-select-meta"></div>
      <div class="level-grid"></div>
      <div class="button-row">
        <button data-action="back-main" class="ghost">返回主菜单</button>
      </div>
    `;
    this.levelSummary = this.levelSelect.querySelector('.level-select-meta') as HTMLDivElement;
    this.levelGrid = this.levelSelect.querySelector('.level-grid') as HTMLDivElement;

    this.hud = document.createElement('div');
    this.hud.className = 'hud hidden';
    this.hud.innerHTML = `
      <div class="hud-left">
        <div class="hud-title">-</div>
        <div class="hud-subtitle">目标：抵达终点环，必要时在控制台中途改态</div>
      </div>
      <div class="hud-right">
        <button data-action="pause">暂停</button>
        <button data-action="reset" class="ghost">重置本关</button>
        <button data-action="back-levels" class="ghost">返回选关</button>
        <button data-action="settings" class="ghost">设置</button>
      </div>
    `;
    this.hudTitle = this.hud.querySelector('.hud-title') as HTMLDivElement;
    this.hudSubtitle = this.hud.querySelector('.hud-subtitle') as HTMLDivElement;

    this.controlDeck = document.createElement('div');
    this.controlDeck.className = 'control-deck hidden';
    this.controlDeck.innerHTML = `
      <div class="control-deck-head">
        <div class="control-title">机关控制台</div>
        <div class="control-tip">所有可点击项都在这里</div>
      </div>
      <div class="control-grid">
        <section class="control-block">
          <div class="block-title">可前往节点</div>
          <div class="node-list"></div>
          <div class="node-empty">暂无可达节点</div>
        </section>
        <section class="control-block">
          <div class="block-title">机关状态</div>
          <div class="interactable-list"></div>
          <div class="interactable-empty">本关无机关，专注路径观察即可。</div>
        </section>
      </div>
    `;
    this.nodeList = this.controlDeck.querySelector('.node-list') as HTMLDivElement;
    this.nodeEmpty = this.controlDeck.querySelector('.node-empty') as HTMLDivElement;
    this.interactableList = this.controlDeck.querySelector('.interactable-list') as HTMLDivElement;
    this.interactableEmpty = this.controlDeck.querySelector('.interactable-empty') as HTMLDivElement;

    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.className = 'panel pause-overlay hidden';
    this.pauseOverlay.innerHTML = `
      <h2>挑战已暂停</h2>
      <p>可以继续当前推演，或回到起点重新规划。</p>
      <div class="button-row">
        <button data-action="resume">继续挑战</button>
        <button data-action="reset" class="ghost">重置本关</button>
        <button data-action="back-levels" class="ghost">回到选关</button>
      </div>
    `;

    this.completeOverlay = document.createElement('div');
    this.completeOverlay.className = 'panel complete-overlay hidden';
    this.completeOverlay.innerHTML = `
      <h2>关卡完成</h2>
      <div class="complete-title"></div>
      <div class="complete-desc"></div>
      <div class="button-row">
        <button data-action="next-level">进入下一关</button>
        <button data-action="back-levels" class="ghost">返回选关</button>
      </div>
    `;
    this.completeTitle = this.completeOverlay.querySelector('.complete-title') as HTMLDivElement;
    this.completeDescription = this.completeOverlay.querySelector('.complete-desc') as HTMLDivElement;
    this.nextLevelButton = this.completeOverlay.querySelector(
      '[data-action="next-level"]'
    ) as HTMLButtonElement;

    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'panel settings-panel hidden';
    this.settingsPanel.innerHTML = `
      <h2>设置</h2>
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
      <label class="checkbox">
        <input data-setting="reducedMotion" type="checkbox" />
        低动态效果
      </label>
      <label>
        语言
        <select data-setting="language">
          <option value="zh-CN">简体中文</option>
          <option value="en">英语（开发中）</option>
        </select>
      </label>
      <div class="button-row">
        <button data-action="close-settings">完成</button>
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
      this.controlDeck,
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
    this.controlDeck.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.settingsPanel.classList.add('hidden');
    this.hideHint();
  }

  showLevelSelect(levels: LevelDef[], unlocked: Set<string>, completed: Set<string>): void {
    this.showOnly(this.levelSelect);
    this.hud.classList.add('hidden');
    this.controlDeck.classList.add('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');

    this.levelGrid.replaceChildren();

    this.levelSummary.textContent = `已解锁 ${unlocked.size}/${levels.length} · 已通关 ${completed.size}/${levels.length}`;

    for (const [index, level] of levels.entries()) {
      const button = document.createElement('button');
      const open = unlocked.has(level.id);
      const done = completed.has(level.id);
      button.className = `level-card ${open ? 'open' : 'locked'} ${done ? 'completed' : ''}`;
      button.disabled = !open;

      const status = !open ? '未解锁' : done ? '已通关' : '可挑战';
      button.innerHTML = `
        <span class="level-index">第 ${index + 1} 关</span>
        <strong>${level.title}</strong>
        <span class="level-desc">${level.description}</span>
        <span class="level-status">${status}</span>
      `;

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
    this.controlDeck.classList.remove('hidden');
    this.pauseOverlay.classList.add('hidden');
    this.completeOverlay.classList.add('hidden');
    this.hudTitle.textContent = levelTitle;
    this.hudSubtitle.textContent = '目标：抵达终点环，必要时在控制台中途改态';
    this.setPaused(false);
  }

  setPaused(paused: boolean): void {
    this.pauseOverlay.classList.toggle('hidden', !paused);
    this.controlDeck.classList.toggle('is-paused', paused);
    const pauseButton = this.hud.querySelector('[data-action="pause"]') as HTMLButtonElement;
    pauseButton.textContent = paused ? '继续' : '暂停';
  }

  showCompletion(levelTitle: string, hasNext: boolean): void {
    this.completeTitle.textContent = `「${levelTitle}」完成`;
    this.completeDescription.textContent = hasNext
      ? '路径已记录，下一关已解锁。'
      : '你已完成本章全部关卡。';
    this.completeOverlay.classList.remove('hidden');
    this.nextLevelButton.disabled = !hasNext;
    this.nextLevelButton.textContent = hasNext ? '进入下一关' : '本章完成';
  }

  hideCompletion(): void {
    this.completeOverlay.classList.add('hidden');
  }

  updateReachableNodes(items: ReachableNodeItem[]): void {
    this.nodeButtons.clear();
    this.nodeList.replaceChildren();

    const hasItems = items.length > 0;
    this.nodeList.classList.toggle('hidden', !hasItems);
    this.nodeEmpty.classList.toggle('hidden', hasItems);

    if (!hasItems) {
      return;
    }

    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'node-chip';
      button.dataset.nodeId = item.id;
      button.textContent = item.label;
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

    const hasItems = items.length > 0;
    this.interactableList.classList.toggle('hidden', !hasItems);
    this.interactableEmpty.classList.toggle('hidden', hasItems);

    if (!hasItems) {
      return;
    }

    for (const item of items) {
      const button = document.createElement('button');
      button.className = 'interactable-chip';
      button.dataset.interactableId = item.id;
      button.innerHTML = `
        <span class="chip-name">${item.name}</span>
        <span class="chip-value">${item.valueLabel}</span>
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
