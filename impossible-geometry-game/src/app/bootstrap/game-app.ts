import type { HitTarget, LevelDef, SaveDataV1 } from '../../shared/types/game';
import { orderedLevels } from '../../content/levels';
import { AnimationController } from '../../engine/animation/animation-controller';
import { AudioService } from '../../engine/audio/audio-service';
import { InputManager } from '../../engine/input/input-manager';
import { SceneManager } from '../../engine/render/scene-manager';
import { findPath } from '../../gameplay/pathfinding/a-star-pathfinder';
import { InteractionSystem } from '../../gameplay/interaction/interaction-system';
import { LevelLoader } from '../../gameplay/level/level-loader';
import { LevelRuntime } from '../../gameplay/level/level-runtime';
import { MovementSystem } from '../../gameplay/movement/movement-system';
import { SaveService } from '../../services/save/save-service';
import { GameUI } from '../../ui/overlay/game-ui';
import { GameStateMachine } from '../state/game-state-machine';

declare global {
  interface Window {
    __IMPOSSIBLE_GEOMETRY_DEBUG__?: {
      startLevel: (levelId: string) => void;
      completeCurrent: () => void;
      getSave: () => SaveDataV1;
    };
  }
}

export class GameApp {
  private readonly stateMachine = new GameStateMachine();

  private readonly loader = new LevelLoader();

  private readonly sceneManager: SceneManager;

  private readonly input: InputManager;

  private readonly ui: GameUI;

  private readonly movement = new MovementSystem(2.25);

  private readonly animationController = new AnimationController();

  private readonly audioService = new AudioService();

  private readonly saveService: SaveService;

  private saveData: SaveDataV1;

  private runtime?: LevelRuntime;

  private interactionSystem?: InteractionSystem;

  private currentLevelId?: string;

  private lastFrameAt = 0;

  private stalledMs = 0;

  private hintShown = false;

  constructor(appRoot: HTMLElement) {
    const stage = document.createElement('div');
    stage.className = 'scene-stage';
    appRoot.append(stage);

    this.sceneManager = new SceneManager(stage);

    this.input = new InputManager(
      this.sceneManager.renderer,
      this.sceneManager.camera,
      {
        onTargetClick: (target) => this.onTargetClick(target)
      }
    );
    this.input.setEnabled(false);

    this.ui = new GameUI(appRoot, {
      onStartJourney: () => this.openLevelSelect(),
      onSelectLevel: (levelId) => this.startLevel(levelId),
      onTogglePause: () => this.togglePause(),
      onResetLevel: () => this.resetCurrentLevel(),
      onBackToLevelSelect: () => this.openLevelSelect(),
      onBackToMainMenu: () => this.showMainMenu(),
      onOpenSettings: () => this.ui.showSettings(),
      onCloseSettings: () => this.ui.hideSettings(),
      onSettingPatch: (patch) => this.patchSettings(patch),
      onNextLevel: () => this.goToNextLevel()
    });

    this.saveService = new SaveService(orderedLevels[0].id);
    this.saveData = this.saveService.load();
    this.ui.updateSettings(this.saveData.settings);

    this.audioService.setLevels({
      master: this.saveData.settings.masterVolume,
      sfx: this.saveData.settings.sfxVolume
    });

    this.registerDebugApi();
    this.showMainMenu();

    window.addEventListener('resize', () => this.sceneManager.resize());
    this.sceneManager.resize();

    requestAnimationFrame(this.tick);
  }

  private tick = (timestamp: number): void => {
    if (!this.lastFrameAt) {
      this.lastFrameAt = timestamp;
    }

    const deltaMs = Math.min(100, timestamp - this.lastFrameAt);
    this.lastFrameAt = timestamp;

    this.animationController.update(deltaMs);

    if (this.runtime && this.stateMachine.appState === 'playing' && this.stateMachine.playState === 'moving') {
      const movementUpdate = this.movement.update(deltaMs / 1000, this.runtime.graph);
      this.sceneManager.setPlayerPosition(movementUpdate.position);

      if (movementUpdate.reachedNodeId) {
        this.runtime.setCurrentNode(movementUpdate.reachedNodeId);
        this.sceneManager.syncRuntime(this.runtime);
      }

      if (movementUpdate.finished) {
        this.stateMachine.setPlayState('idle');
        this.audioService.ping('ok');
        this.checkGoalCompletion();
      }
    }

    if (this.runtime && this.stateMachine.appState === 'playing' && this.stateMachine.playState === 'idle') {
      this.stalledMs += deltaMs;
      if (this.stalledMs >= 45_000 && !this.hintShown) {
        this.ui.showHint(this.runtime.level.hint);
        this.hintShown = true;
      }
    }

    this.sceneManager.render();
    requestAnimationFrame(this.tick);
  };

  private showMainMenu(): void {
    this.stateMachine.setAppState('mainMenu');
    this.stateMachine.setPlayState('idle');
    this.input.setEnabled(false);
    this.ui.showMainMenu();
  }

  private openLevelSelect(): void {
    this.stateMachine.setAppState('levelSelect');
    this.stateMachine.setPlayState('idle');
    this.input.setEnabled(false);
    this.ui.hideSettings();
    this.ui.hideCompletion();
    this.ui.hideHint();
    this.ui.showLevelSelect(
      orderedLevels,
      new Set(this.saveData.unlockedLevelIds),
      new Set(this.saveData.completedLevelIds)
    );
  }

  private startLevel(levelId: string): void {
    const level = this.loader.getLevel(levelId);
    this.currentLevelId = levelId;

    this.stateMachine.setAppState('loadingLevel');
    this.stateMachine.setPlayState('transitioning');

    this.saveService.setLastPlayed(levelId);
    this.saveData = this.saveService.get();

    this.runtime = new LevelRuntime(level);
    this.interactionSystem = new InteractionSystem(this.runtime);

    this.sceneManager.applyLevelCamera(level);
    this.runtime.rebuild(this.sceneManager.camera, this.sceneManager.aspect);
    this.sceneManager.loadLevel(this.runtime);

    this.movement.teleport(this.runtime.getCurrentNodePosition());
    this.sceneManager.setPlayerPosition(this.runtime.getCurrentNodePosition());

    this.input.setPickables(this.sceneManager.getPickables());
    this.input.setEnabled(true);

    this.stateMachine.setAppState('playing');
    this.stateMachine.setPlayState('idle');
    this.resetStallTimer();
    this.ui.hideSettings();
    this.ui.hideCompletion();
    this.ui.showPlaying(level.title);
  }

  private onTargetClick(target: HitTarget): void {
    if (!this.runtime || !this.stateMachine.canAcceptGameplayInput()) {
      return;
    }

    if (target.kind === 'node') {
      this.tryMoveToNode(target.id);
      return;
    }

    this.tryInteract(target.id);
  }

  private tryMoveToNode(targetNodeId: string): void {
    if (!this.runtime || !this.stateMachine.canAcceptGameplayInput()) {
      return;
    }

    const path = findPath(this.runtime.graph, this.runtime.currentNodeId, targetNodeId);
    if (!path || path.length <= 0) {
      this.audioService.ping('error');
      this.sceneManager.flashInvalidNode(targetNodeId);
      this.ui.notify('当前路径未连通');
      return;
    }

    if (path.length === 1) {
      return;
    }

    this.stateMachine.setPlayState('moving');
    this.movement.begin(path, this.runtime.graph);
    this.audioService.ping('click');
    this.resetStallTimer();
  }

  private tryInteract(interactableId: string): void {
    if (!this.runtime || !this.interactionSystem || !this.stateMachine.canAcceptGameplayInput()) {
      return;
    }

    const step = this.interactionSystem.createStep(interactableId, this.saveData.settings.reducedMotion);
    this.stateMachine.setPlayState('interacting');
    this.audioService.ping('click');
    this.resetStallTimer();

    this.animationController.animate(
      step.durationMs,
      (t) => this.sceneManager.pulseInteractable(interactableId, t),
      () => {
        if (!this.runtime || !this.interactionSystem) {
          return;
        }

        this.sceneManager.restoreInteractableScale(interactableId);
        this.interactionSystem.commit(step);
        this.runtime.rebuild(this.sceneManager.camera, this.sceneManager.aspect);
        this.sceneManager.syncRuntime(this.runtime);
        this.stateMachine.setPlayState('idle');
        this.audioService.ping('ok');
      }
    );
  }

  private checkGoalCompletion(): void {
    if (!this.runtime || this.stateMachine.appState !== 'playing') {
      return;
    }

    if (this.runtime.currentNodeId !== this.runtime.level.goalNodeId) {
      return;
    }

    this.completeLevel();
  }

  private completeLevel(): void {
    if (!this.runtime || !this.currentLevelId) {
      return;
    }

    this.stateMachine.setAppState('completing');
    this.stateMachine.setPlayState('transitioning');
    this.input.setEnabled(false);

    this.saveService.markCompleted(this.currentLevelId);
    const next = this.getNextLevel(this.currentLevelId);
    if (next) {
      this.saveService.unlockLevel(next.id);
    }
    this.saveData = this.saveService.get();

    this.audioService.ping('goal');
    this.ui.showCompletion(this.runtime.level.title, Boolean(next));
  }

  private goToNextLevel(): void {
    if (!this.currentLevelId) {
      this.openLevelSelect();
      return;
    }

    const next = this.getNextLevel(this.currentLevelId);
    if (!next) {
      this.openLevelSelect();
      return;
    }

    this.startLevel(next.id);
  }

  private togglePause(): void {
    if (this.stateMachine.appState === 'playing') {
      this.stateMachine.setAppState('paused');
      this.ui.setPaused(true);
      this.input.setEnabled(false);
      return;
    }

    if (this.stateMachine.appState === 'paused') {
      this.stateMachine.setAppState('playing');
      this.ui.setPaused(false);
      this.input.setEnabled(true);
    }
  }

  private resetCurrentLevel(): void {
    if (!this.runtime) {
      return;
    }

    this.runtime.reset();
    this.runtime.rebuild(this.sceneManager.camera, this.sceneManager.aspect);
    this.sceneManager.syncRuntime(this.runtime);
    this.movement.teleport(this.runtime.getCurrentNodePosition());
    this.sceneManager.setPlayerPosition(this.runtime.getCurrentNodePosition());
    this.stateMachine.setAppState('playing');
    this.stateMachine.setPlayState('idle');
    this.input.setEnabled(true);
    this.ui.setPaused(false);
    this.ui.hideCompletion();
    this.ui.notify('本关已重置');
    this.resetStallTimer();
  }

  private patchSettings(patch: Partial<SaveDataV1['settings']>): void {
    const updated = this.saveService.updateSettings(patch);
    this.saveData = this.saveService.get();
    this.audioService.setLevels({
      master: updated.masterVolume,
      sfx: updated.sfxVolume
    });
    this.ui.updateSettings(updated);
  }

  private resetStallTimer(): void {
    this.stalledMs = 0;
    this.hintShown = false;
    this.ui.hideHint();
  }

  private getNextLevel(currentLevelId: string): LevelDef | undefined {
    const index = orderedLevels.findIndex((level) => level.id === currentLevelId);
    if (index < 0 || index + 1 >= orderedLevels.length) {
      return undefined;
    }

    return orderedLevels[index + 1];
  }

  private registerDebugApi(): void {
    if (!import.meta.env.DEV) {
      return;
    }

    window.__IMPOSSIBLE_GEOMETRY_DEBUG__ = {
      startLevel: (levelId: string) => this.startLevel(levelId),
      completeCurrent: () => {
        if (!this.runtime) {
          return;
        }

        this.runtime.setCurrentNode(this.runtime.level.goalNodeId);
        this.sceneManager.syncRuntime(this.runtime);
        this.completeLevel();
      },
      getSave: () => this.saveData
    };
  }
}
