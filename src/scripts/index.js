import { addSwitchEvent, loadAppTheme } from './theme.js';
import { addKeysEvent } from './calculator.js';

window.addEventListener('DOMContentLoaded', () => {
  addSwitchEvent();
  addKeysEvent();
  loadAppTheme();
});
