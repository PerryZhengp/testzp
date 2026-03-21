export type AppState =
  | 'boot'
  | 'mainMenu'
  | 'levelSelect'
  | 'loadingLevel'
  | 'playing'
  | 'paused'
  | 'completing'
  | 'settings';

export type PlayState = 'idle' | 'moving' | 'interacting' | 'transitioning';

export class GameStateMachine {
  appState: AppState = 'boot';

  playState: PlayState = 'idle';

  setAppState(next: AppState): void {
    this.appState = next;
  }

  setPlayState(next: PlayState): void {
    this.playState = next;
  }

  canAcceptGameplayInput(): boolean {
    return this.appState === 'playing' && this.playState === 'idle';
  }

  isBusyAnimating(): boolean {
    return this.playState === 'moving' || this.playState === 'interacting';
  }
}
