import { addSwitchEvent, loadAppTheme } from './theme.js';
import { addKeysEvent } from './calculator.js';

window.addEventListener('DOMContentLoaded', () => {
  addSwitchEvent();
  addKeysEvent();
  loadAppTheme();
  document.querySelector('.calculator__result').textContent =
    '270038681876704580';
});
