import { addSwitchEvent, loadAppTheme } from "./theme.js";

window.addEventListener("load", () => {
  addSwitchEvent();
  loadAppTheme();
});
