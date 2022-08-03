import { Expression } from './lib/Expression.js';
import { MathSymbol } from './lib/MathSymbol.js';

const expression = new Expression();

const KEY_TYPES = {
  number: storageDigit,
  operator: storageOperator,
  action: {
    equal: calculateExpression,
    delete: deleteLastDigit,
    reset: () => expression.clear(),
  },
};

const VALUE_TYPES = {
  number: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'],
  operator: ['/', 'x', '-', '+'],
  action: ['equal', 'delete'],
};

function handleKeyClick({ currentTarget: key }) {
  const value = key.value;
  const type = getKeyTypeClicked(key);

  if (expression.hasError()) {
    expression.clear();
  }

  if (KEY_TYPES[type][value]) {
    KEY_TYPES[type][value]();
  } else {
    KEY_TYPES[type](value);
  }

  renderExpression(expression.values);
  scrollDisplayToRight();
}

function getKeyTypeClicked(key) {
  return key.dataset.type;
}

function handleKeyPress(event) {
  const value = getKeyValuePressed(event);
  const type = getKeyTypePressed(value);

  if (type === null) return;
  event.preventDefault();

  if (expression.hasError()) {
    expression.clear();
  }

  if (KEY_TYPES[type][value]) {
    KEY_TYPES[type][value]();
  } else {
    KEY_TYPES[type](value);
  }

  renderExpression(expression.values);
  scrollDisplayToRight();
}

function getKeyValuePressed(event) {
  const key = event.key.toLowerCase();

  switch (key) {
    case '*':
      return 'x';
    case ',':
      return '.';
    case 'enter':
      return 'equal';
    case 'backspace':
      return 'delete';
    default:
      return key;
  }
}

function getKeyTypePressed(key) {
  for (const [type, keys] of Object.entries(VALUE_TYPES)) {
    if (keys.includes(key)) {
      return type;
    }
  }

  return null;
}

function storageDigit(digit) {
  if (expression.isEmpty()) {
    expression.addSymbol(digit, 'number');
    return;
  }

  if (expression.lastSymbol.type === 'operator') {
    expression.addSymbol(digit, 'number');
    return;
  }

  const hasDecimalPoint = expression.lastSymbol.value.includes('.');
  const hasZeroBeforeIntegerOrDecimalPlace =
    expression.lastSymbol.value === '0';

  if (
    (digit === '.' && hasDecimalPoint) ||
    (digit === '0' && hasZeroBeforeIntegerOrDecimalPlace)
  ) {
    return;
  }

  expression.lastSymbol.append(digit);
}

function renderExpression(values) {
  const $display = document.querySelector('.calculator__result');
  if (expression.hasError()) {
    $display.textContent = "Can't divide by 0";
    return;
  }
  $display.textContent = values.map((item) => item.value).join('');
}

function scrollDisplayToRight() {
  const $display = document.querySelector('.calculator__result');
  $display.scrollLeft = $display.scrollLeftMax;
}

function storageOperator(operator) {
  if (expression.isEmpty()) {
    if (operator === '-') {
      expression.addSymbol(operator, 'number');
    }
    return;
  }

  if (
    expression.lastSymbol.type === 'number' &&
    expression.lastSymbol.value === '-'
  ) {
    return;
  }

  if (expression.lastSymbol.type === 'operator') {
    if (operator === '-') {
      expression.addSymbol(operator, 'number');
      return;
    }

    expression.lastSymbol.value = operator;
    return;
  }

  expression.addSymbol(operator, 'operator');
}

const operations = {
  sum: (a, b = 0) => a + b,
  subtract: (a, b = 0) => a - b,
  divide: (a, b = 1) => a / b,
  multiply: (a, b = 1) => a * b,
};

function calculateExpression() {
  if (expression.isEmpty()) return;

  let calculatedExpression = expression.values;

  const indexsOfMultAndDivision =
    getIndexsOfMultAndDivision(calculatedExpression);

  if (indexsOfMultAndDivision.length > 0) {
    const multAndDivisionResults = calculateMultAndDivision(
      calculatedExpression,
      indexsOfMultAndDivision
    );
    calculatedExpression = replaceCalculatedOperationsByResult(
      calculatedExpression,
      multAndDivisionResults
    );
  }

  const sumAndSubtractionResult =
    calculateSumAndSubtraction(calculatedExpression);
  expression._values = [sumAndSubtractionResult];
}

function getIndexsOfMultAndDivision(expression) {
  const indexs = [];

  expression.forEach((item, index) => {
    if (item.value === '/' || item.value === 'x') {
      indexs.push(index);
    }
  });

  return indexs;
}

function calculateMultAndDivision(expression, indexs) {
  const results = [];

  const calculateOperation = (a, b, operationFunc) =>
    operationFunc(Number(a), Number(b));

  const pushResultToResultsList = (result, index) => {
    results.push({
      indexs: [index - 1, index, index + 1],
      result: String(result),
    });
  };

  const OPERATORS_FUNCTION = {
    x: operations.multiply,
    '/': operations.divide,
  };

  for (let i = 0; i < indexs.length; i++) {
    let numberBeforeOperator = expression[indexs[i] - 1]?.value;
    let numberAfterOperator = expression[indexs[i] + 1]?.value || 1;

    if (indexs[i - 1] === indexs[i] - 2) {
      numberBeforeOperator = results[i - 1].result;
    }

    if (numberAfterOperator === '-') {
      numberAfterOperator = 1;
    }

    const currentOperator = expression[indexs[i]].value;

    const result = calculateOperation(
      numberBeforeOperator,
      numberAfterOperator,
      OPERATORS_FUNCTION[currentOperator]
    );

    pushResultToResultsList(result, indexs[i]);
  }

  return results;
}

function replaceCalculatedOperationsByResult(expression, results) {
  const newExpression = [];

  for (
    let expressionIndex = 0;
    expressionIndex < expression.length;
    expressionIndex++
  ) {
    let canPush = true;

    for (let resultsIndex = 0; resultsIndex < results.length; resultsIndex++) {
      if (
        results[resultsIndex].indexs[0] === expressionIndex &&
        results[resultsIndex].indexs[2] !== results[resultsIndex + 1]?.indexs[0]
      ) {
        newExpression.push(
          new MathSymbol(results[resultsIndex].result, 'number')
        );
      }

      if (results[resultsIndex].indexs.includes(expressionIndex)) {
        canPush = false;
      }
    }

    if (canPush) {
      newExpression.push(expression[expressionIndex]);
    }
  }

  return newExpression;
}

function calculateSumAndSubtraction(expression) {
  const OPERATORS_FUNCTION = {
    '+': operations.sum,
    '-': operations.subtract,
  };

  const result = expression.reduce((accumulator, currentValue, index, arr) => {
    if (currentValue.type !== 'number' || currentValue.value === '-') {
      return accumulator;
    }

    const operator = arr[index - 1]?.value || '+';

    return OPERATORS_FUNCTION[operator](
      accumulator,
      Number(currentValue.value)
    );
  }, 0);
  if (result === Infinity || isNaN(result)) {
    return new MathSymbol(String(result), 'error');
  }

  return new MathSymbol(String(result), 'number');
}

function deleteLastDigit() {
  if (expression.isEmpty()) return;

  if (expression.hasError()) {
    expression.clear();
    return;
  }

  if (expression.lastSymbol.type === 'operator') {
    expression.removeLastSymbol();
    return;
  }

  expression.lastSymbol.pop();
  if (expression.lastSymbol.isEmpty()) {
    expression.removeLastSymbol();
  }
}

export function addKeysEvent() {
  const $keys = document.querySelectorAll('.keys');
  $keys.forEach((key) => key.addEventListener('click', handleKeyClick));
  document.body.addEventListener('keydown', handleKeyPress);
}
