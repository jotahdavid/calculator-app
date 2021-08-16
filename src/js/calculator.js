export function addKeysEvent() {
  const $keys = document.querySelectorAll(".keys");
  $keys.forEach(key => key.addEventListener("click", handleKeyClick));
}

const $display = document.querySelector(".calculator__result");
let expression = [];

function handleKeyClick({ currentTarget: key }) {
  const type = getKeyType(key);
  const value = key.value;

  if(checkIfExpressionHasError()) {
    clearAllExpression();
  }

  const KEY_TYPES = {
    number: storageDigit,
    operator: storageOperator,
    action: {
        equal: calculateExpression,
        delete: deleteLastDigit,
        reset: clearAllExpression
    }
  };

  KEY_TYPES[type][value] ? KEY_TYPES[type][value]() : KEY_TYPES[type](value);

  renderExpression();

  if($display.scrollLeftMax > $display.scrollLeft) {
    scrollDisplayToRight();
  }
}

function getKeyType(key) {
  return key.dataset.type;
}

function storageDigit(digit) {
  if(isExpressionEmpty()) {
    expression.push(
      createValueForExpression(digit, "number")
    );
    return;
  }
  
  const lastIndex = getLastIndexOfArray(expression);

  if(expression[lastIndex].type === "operator") {
    expression.push(
      createValueForExpression(digit, "number")
    );
    return;
  }

  const valueOfTheLastIndex = expression[lastIndex].value;
  
  const numberAlreadyHasDecimalPoint = valueOfTheLastIndex.includes(".");
  const hasOneZeroBeforeIntegerOrDecimalPlace = valueOfTheLastIndex === "0";

  if(
    (digit === "." && numberAlreadyHasDecimalPoint) ||
    (digit === "0" && hasOneZeroBeforeIntegerOrDecimalPlace)
  ) return;

  expression[lastIndex].value += digit;
}

function renderExpression() {
  if(checkIfExpressionHasError()) {
    $display.textContent = "Can't divide by 0";
    return;
  }

  $display.textContent = expression.map(item => item.value).join("");
}

function scrollDisplayToRight() {
  $display.scrollLeft = $display.scrollLeftMax;
}

function storageOperator(operator) {
  if(isExpressionEmpty()) return;

  const lastIndex = getLastIndexOfArray(expression);

  if(expression[lastIndex].type === "operator") {
    expression[lastIndex].value = operator;
    return;
  };

  expression.push(
    createValueForExpression(operator, "operator")
  );
}

const operations = {
  sum: (a, b = 0) => a + b,
  subtract: (a, b = 0) => a - b,
  divide: (a, b = 1) => a / b,
  multiply: (a, b = 1) => a * b
};

function calculateExpression() {
  if(isExpressionEmpty()) return;

  const indexsOfMultAndDivision = getIndexsOfMultAndDivision();

  if(indexsOfMultAndDivision) {
    const multAndDivisionResults = calculateMultAndDivision(indexsOfMultAndDivision);
    expression = replaceCalculatedOperationsByResult(multAndDivisionResults);
  }

  const sumAndSubtractionResult = calculateSumAndSubtraction();
  expression = [ sumAndSubtractionResult ];
}

function getIndexsOfMultAndDivision() {
  const indexs = [];

  expression.forEach((item, index) => {
    if(item.value === "/" || item.value === "x") {
      indexs.push(index);
    }
  });

  return indexs;
}

function calculateMultAndDivision(indexs) {
  const results = [];

  const calculateOperation = (a, b, operationFunc) => (
    operationFunc(Number(a), Number(b))
  );

  const pushResultToResultsList = (result, index) => {
    results.push({
      indexs: [
        index-1, index, index+1
      ],
      result: String(result)
    });
  }

  const OPERATORS_FUNCTION = {
    "x": operations.multiply,
    "/": operations.divide
  };

  for(let i = 0; i < indexs.length; i++) {
    let numberBeforeOperator = expression[indexs[i] - 1]?.value;
    let numberAfterOperator = expression[indexs[i] + 1]?.value || 1;

    if(indexs[i - 1] === indexs[i] - 2) {
      numberBeforeOperator = results[i - 1].result;
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

function replaceCalculatedOperationsByResult(results) {
  const newExpression = [];

  for(let expressionIndex = 0; expressionIndex < expression.length; expressionIndex++) {
    let canPush = true;

    for(let resultsIndex = 0; resultsIndex < results.length; resultsIndex++) {
      if(
        results[resultsIndex].indexs[0] === expressionIndex &&
        results[resultsIndex].indexs[2] !== results[resultsIndex + 1]?.indexs[0]
      ) {
        newExpression.push(
          createValueForExpression(results[resultsIndex].result, "number")
        );
      }

      if(results[resultsIndex].indexs.includes(expressionIndex)) {
        canPush = false;
      }
    }

    if(canPush) {
      newExpression.push(expression[expressionIndex]);
    }
  }

  return newExpression;
}

function calculateSumAndSubtraction() {
  const OPERATORS_FUNCTION = {
    "+": operations.sum,
    "-": operations.subtract
  };

  const result = expression.reduce((accumulator, currentValue, index, arr) => {
    if(currentValue.type !== "number") {
      return accumulator;
    }

    const operator = arr[index - 1]?.value || "+";

    return OPERATORS_FUNCTION[operator](
      accumulator,
      Number(currentValue.value)
    );
  }, 0);

  if(result === Infinity || isNaN(result)) {
    return createValueForExpression(result, "error");
  }

  return createValueForExpression(result, "number");
}

function createValueForExpression(value, type) {
  return {
    value: String(value),
    type
  };
}

function deleteLastDigit() {
  const lastIndex = getLastIndexOfArray(expression);

  if(isExpressionEmpty()) return;

  if(checkIfExpressionHasError()) {
    clearAllExpression();
    return;
  }

  if(expression[lastIndex].type === "operator") {
    expression.pop();
    return;
  }

  expression[lastIndex].value = expression[lastIndex].value.slice(0, -1);

  if(expression[lastIndex].value.length === 0) {
    expression.pop();
  }
}

function getLastIndexOfArray(arr) {
  return arr.length - 1;
}

function isExpressionEmpty() {
  return expression.length === 0;
}

function checkIfExpressionHasError() {
  return expression.some(value => value.type === "error");
}

function clearAllExpression() {
  expression = [];
}
