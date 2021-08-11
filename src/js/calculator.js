export function addKeysEvent() {
  const $keys = document.querySelectorAll(".keys");
  $keys.forEach(key => key.addEventListener("click", handleKeyClick));
}

const $display = document.querySelector(".calculator__result");

function handleKeyClick({ currentTarget: key }) {
  const keyType = getKeyType(key);

  switch(keyType) {
    case "number":
      storageDigit(key);
      break;
    case "operator":
      storageOperator(key);
      break;
    case "action":
      if(key.value === "equal") calculateExpression();
      if(key.value === "delete") deleteLastDigit();
      if(key.value === "reset") clearAllExpression();
      break;
    default:
      return;
  }

  displayExpression();
}

function getKeyType(key) {
  return key.dataset.type;
}

let expression = [];

function storageDigit({ value: digit }) {
  if(expression[0]?.type === "error") clearAllExpression();

  if(expression.length === 0) {
    if(digit === ".") {
      digit = "0.";
    }

    expression.push(
      { value: digit, type: "number" }
    );
    return;
  }
  
  const lastIndex = getLastIndexOfArray(expression);

  if(expression[lastIndex].value.length > 0) {
    if(expression[lastIndex].type !== "number") {
      if(digit === ".") {
        digit = "0.";
      }

      expression.push(
        { value: digit, type: "number" }
      );
      return;
    }
    
    if(digit === "." && expression[lastIndex].value.includes(digit)) return;

    if(digit === "0" && expression[lastIndex].value === "0") return;

    expression[lastIndex].value += digit;
    return;
  }
}

function displayExpression() {
  if(expression.length === 0) {
    $display.textContent = "|";
    return;
  }

  if(expression[0]?.type === "error") {
    $display.textContent = "Can't divide by 0";
    return;
  }

  $display.textContent = expression.map(item => item.value).join("");
}

function storageOperator({ value: operator }) {
  if(expression[0]?.type === "error") clearAllExpression();

  if(expression.length === 0) return;

  const lastIndex = getLastIndexOfArray(expression);

  if(expression[lastIndex].type === "operator") {
    expression[lastIndex].value = operator;
    return;
  };

  expression.push(
    { value: operator, type: "operator" }
  );
}

function getLastIndexOfArray(arr) {
  return arr.length - 1;
}

const operations = {
  sum: (a, b = 0) => a + b,
  subtract: (a, b = 0) => a - b,
  divide: (a, b = 1) => a / b,
  multiply: (a, b = 1) => a * b
};

function calculateExpression() {
  if(expression.length === 0) return;

  const indexsOfMultAndDivision = getIndexsOfMultAndDivision();

  if(indexsOfMultAndDivision) {
    const multAndDivisionResults = calculateMultAndDivision(indexsOfMultAndDivision);
    expression = getNewExpression(multAndDivisionResults);
  }

  const sumAndSubtractionResults = calculateSumAndSubtraction();
  expression = sumAndSubtractionResults;
}

function getIndexsOfMultAndDivision() {
  const indexs = [];

  for(let i = 0; i < expression.length; i++) {
    if(expression[i].value === "/" || expression[i].value === "x") {
      indexs.push(i);
    }
  }

  return indexs;
}

function calculateMultAndDivision(indexs) {
  const results = [];

  for(let i = 0; i < indexs.length; i++) {
    let previousNumber = expression[indexs[i]-1]?.value;
    let nextNumber = expression[indexs[i]+1]?.value || 1;

    if(indexs[i-1] === indexs[i] - 2) {
      previousNumber = results[i-1].result;
    }

    if(expression[indexs[i]].value === "x") {
      const result = operations.multiply(
        Number(previousNumber),
        Number(nextNumber)
      );

      results.push(
        {
          indexs: [
            indexs[i]-1,
            indexs[i],
            indexs[i]+1
          ],
          result: String(result)
        }
      );
    } else if(expression[indexs[i]].value === "/") {
      const result = operations.divide(
        Number(previousNumber),
        Number(nextNumber)
      );

      results.push(
        {
          indexs: [
            indexs[i]-1,
            indexs[i],
            indexs[i]+1
          ],
          result: String(result)
        }
      );
    }
  }

  return results;
}

function getNewExpression(results) {
  const newExpression = [];

  for(let i = 0; i < expression.length; i++) {
    let canPush = true;

    for(let j = 0; j < results.length; j++) {
      if(
        results[j].indexs[0] === i &&
        results[j].indexs[2] !== results[j+1]?.indexs[0]
      ) {
        newExpression.push(
          { value: results[j].result, type: "number" }
        );
      }

      if(results[j].indexs.includes(i)) {
        canPush = false;
      }
    }

    if(canPush) {
      newExpression.push(expression[i]);
    }
  }

  return newExpression;
}

function calculateSumAndSubtraction() {
  const result = expression.reduce((accumulator, currentValue, index, arr) => {
    if(currentValue.type !== "number") {
      return accumulator;
    }

    if(arr[index - 1]?.value === "-") {
      return accumulator - Number(currentValue.value);
    }

    return accumulator + Number(currentValue.value);
  }, 0);

  if(result === Infinity || isNaN(result)) {
    return [
      {
        value: String(result),
        type: "error"
      }
    ];
  }

  return [
    {
      value: String(result),
      type: "number"
    }
  ];
}

function deleteLastDigit() {
  const lastIndex = getLastIndexOfArray(expression);

  if(expression[lastIndex].type === "operator") {
    expression.pop();
    return;
  }

  expression[lastIndex].value = expression[lastIndex].value.slice(0, -1);

  if(expression[lastIndex].value.length === 0) {
    expression.pop();
  }
}

function clearAllExpression() {
  expression = [];
}
