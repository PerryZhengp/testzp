import './style.css';
import { GameApp } from './app/bootstrap/game-app';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('Missing #app root element.');
}

new GameApp(appRoot);
