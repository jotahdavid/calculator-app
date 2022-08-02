import { addSwitchEvent, loadAppTheme } from './theme.js';
import { addKeysEvent } from './calculator.js';

window.addEventListener('load', () => {
  addSwitchEvent();
  addKeysEvent();
  loadAppTheme();
});
