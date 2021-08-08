function storeAppTheme(themeIndex) {
  localStorage.setItem("APP_THEME", JSON.stringify(themeIndex));
}

function getAppThemeStored() {
  let themeIndex = JSON.parse(localStorage.getItem("APP_THEME")) || 1;

  if(themeIndex < 1 || themeIndex > 3) {
    themeIndex = 1;
  }

  return themeIndex;
}

function getSliderIndex() {
  const { dataset: { index } } = document.querySelector(".switch__slider");
  return index;
}

function changeSliderIndex(themeIndex) {
  const { dataset: sliderData } = document.querySelector(".switch__slider");

  if(themeIndex) {
    sliderData.index = themeIndex;
  } else {
    sliderData.index < 3 ? sliderData.index++ : sliderData.index = 1;
  }
}

export function loadAppTheme() {
  const themeIndex = getAppThemeStored();
  switchTheme(themeIndex);
  changeSliderIndex(themeIndex);
}

function switchTheme(themeIndex) {
  const $body = document.body;
  $body.classList = `-theme${themeIndex}`;
}

export function addSwitchEvent() {
  const handleSwitchClick = (event) => {
    event.preventDefault();

    changeSliderIndex();
    const themeIndex = getSliderIndex();
    switchTheme(themeIndex);
    storeAppTheme(themeIndex);
  }

  const $switchButton = document.querySelector(".switch__field");
  $switchButton.addEventListener("click", handleSwitchClick);
}
