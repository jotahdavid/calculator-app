const LOCAL_STORAGE_KEY = 'CALCULATOR_THEME';

function storeAppTheme(themeIndex) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(themeIndex));
}

function getAppThemeStored() {
  const themeIndex =
    Number(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))) ?? 1;

  return isIndexBetweenSliderLimit(themeIndex) ? themeIndex : 1;

  function isIndexBetweenSliderLimit(index) {
    return index >= 1 && index <= 3;
  }
}

function getSliderIndex() {
  const $slider = document.querySelector('.switch__slider');
  return Number($slider.getAttribute('data-index'));
}

function setSliderIndex(index) {
  const $slider = document.querySelector('.switch__slider');
  $slider.setAttribute('data-index', index);
}

function increaseSliderIndex() {
  const oldIndex = getSliderIndex();
  const newIndex = oldIndex < 3 ? oldIndex + 1 : 1;
  setSliderIndex(newIndex);
}

function switchTheme(themeIndex) {
  const $body = document.body;
  $body.setAttribute('data-theme', themeIndex);
}

export function loadAppTheme() {
  const themeIndex = getAppThemeStored();
  switchTheme(themeIndex);
  setSliderIndex(themeIndex);
}

export function addSwitchEvent() {
  const handleSwitchClick = (event) => {
    event.preventDefault();
    increaseSliderIndex();

    const themeIndex = getSliderIndex();
    switchTheme(themeIndex);
    storeAppTheme(themeIndex);
  };

  const $switchButton = document.querySelector('.switch__field');
  $switchButton.addEventListener('click', handleSwitchClick);
}
