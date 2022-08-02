/**
 * @typedef {'number' | 'operator' | 'error'} MathSymbolType
 */
const TYPES = ['number', 'operator', 'error'];

export class MathSymbol {
  /**
   * @param {string} value
   * @param {MathSymbolType} type
   */
  constructor(value, type) {
    this.value = value;
    if (!TYPES.includes(type)) {
      throw new TypeError(`Math Symbol Type must be ${TYPES.join(' | ')}`);
    }
    this.type = type;
  }

  /**
   * @param {string} digit
   * @returns {string}
   */
  append(digit) {
    this.value += digit;
    return this.value;
  }

  /**
   * @returns {string}
   */
  pop() {
    this.value = this.value.slice(0, -1);
    return this.value;
  }

  /**
   * @returns {boolean}
   */
  isEmpty() {
    return this.value.length === 0;
  }
}
