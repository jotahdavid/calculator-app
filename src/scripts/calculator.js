import { Expression } from './lib/Expression.js';
import { MathSymbol } from './lib/MathSymbol.js';

const expression = new Expression();

function handleKeyClick({ currentTarget: key }) {
  const value = key.value;
  const type = getKeyTypeClicked(key);

  handleCalculatorAction(value, type);
}

function getKeyTypeClicked(key) {
  return key.dataset.type;
}

function handleKeyPress(event) {
  const value = getKeyValuePressed(event);
  const type = getKeyTypePressed(value);

  if (type === null) return;
  event.preventDefault();

  handleCalculatorAction(value, type);
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

const VALUE_TYPES = {
  number: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'],
  operator: ['/', 'x', '-', '+'],
  action: ['equal', 'delete'],
};

function getKeyTypePressed(key) {
  for (const [type, keys] of Object.entries(VALUE_TYPES)) {
    if (keys.includes(key)) {
      return type;
    }
  }

  return null;
}

function handleCalculatorAction(value, type) {
  if (expression.hasError()) {
    expression.clear();
  }

  runCalculatorAction(value, type);
  renderExpression(expression.values);
}

const KEY_TYPES = {
  number: storageDigit,
  operator: storageOperator,
  action: {
    equal: calculateExpression,
    delete: deleteLastDigit,
    reset: () => expression.clear(),
  },
};

function runCalculatorAction(value, type) {
  if (KEY_TYPES[type][value]) {
    KEY_TYPES[type][value]();
    return;
  }

  KEY_TYPES[type](value);
}

function storageDigit(digit) {
  if (expression.isEmpty() || expression.lastSymbol.type === 'operator') {
    if (digit === '.') {
      expression.addSymbol('0.', 'number');
      return;
    }

    expression.addSymbol(digit, 'number');
    return;
  }

  const hasDecimalPoint = expression.lastSymbol.value.includes('.');
  if (digit === '.' && hasDecimalPoint) return;

  if (digit === '.' && expression.lastSymbol.value === '-') {
    expression.lastSymbol.append('0.');
    return;
  }

  expression.lastSymbol.append(digit);
}

function storageOperator(operator) {
  if (expression.isEmpty()) {
    if (operator === '-') {
      storageDigit(operator);
    }
    return;
  }

  if (
    expression.lastSymbol.type === 'number' &&
    expression.lastSymbol.value === '-'
  ) {
    return;
  }

  if (expression.lastSymbol.type !== 'operator') {
    expression.addSymbol(operator, 'operator');
    return;
  }

  if (expression.lastSymbol.type === 'operator' && operator === '-') {
    storageDigit(operator);
    return;
  }

  expression.lastSymbol.value = operator;
}

const OPERATIONS = {
  sum: (a, b = 0) => a + b,
  subtract: (a, b = 0) => a - b,
  divide: (a, b = 1) => a / b,
  multiply: (a, b = 1) => a * b,
};

function calculateExpression() {
  if (expression.isEmpty()) return;

  const expressionValues = expression.values;
  expression.clear();

  try {
    const multAndDivisionResults = calculateMultAndDivision(expressionValues);
    const result = calculateSumAndSubtraction(
      replaceCalculatedOperations(expressionValues, multAndDivisionResults)
    );
    expression.addSymbol(result.value, result.type);
  } catch (err) {
    expression.addSymbol(err.message, 'error');
  }
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

function calculateMultAndDivision(expression) {
  const indexs = getIndexsOfMultAndDivision(expression);

  const results = [];

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

    if (currentOperator === '/' && numberAfterOperator === '0') {
      throw new Error(`Can't divide by 0`);
    }

    const result = calculateOperation(
      numberBeforeOperator,
      numberAfterOperator,
      currentOperator
    );

    results.push(parseResult(result, indexs[i]));
  }

  return results;

  function calculateOperation(x, y, operator) {
    const OPERATORS_FUNCTION = {
      x: OPERATIONS.multiply,
      '/': OPERATIONS.divide,
    };

    return OPERATORS_FUNCTION[operator](Number(x), Number(y));
  }

  function parseResult(result, index) {
    return {
      indexs: [index - 1, index, index + 1],
      result: String(result),
    };
  }
}

function replaceCalculatedOperations(expression, results) {
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
    '+': OPERATIONS.sum,
    '-': OPERATIONS.subtract,
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
    return { value: String(result), type: 'error' };
  }
  return { value: String(result), type: 'number' };
}

function deleteLastDigit() {
  if (expression.isEmpty()) return;

  if (expression.hasError()) {
    expression.clear();
    return;
  }

  expression.lastSymbol.pop();
  if (
    expression.lastSymbol.isEmpty() ||
    expression.lastSymbol.type === 'operator'
  ) {
    expression.removeLastSymbol();
  }
}

function renderExpression(values) {
  const $display = document.querySelector('.calculator__result');
  if (expression.hasError()) {
    const error = expression.values.find((item) => item.type === 'error');
    $display.textContent = error.value;
  } else {
    $display.textContent = values.map((item) => item.value).join('');
  }
  scrollDisplayToRight();
}

function scrollDisplayToRight() {
  const $display = document.querySelector('.calculator__result');
  $display.scrollLeft = $display.scrollLeftMax;
}

export function addKeysEvent() {
  const $keys = document.querySelectorAll('.keys');
  $keys.forEach((key) => key.addEventListener('click', handleKeyClick));
  document.body.addEventListener('keydown', handleKeyPress);
}
