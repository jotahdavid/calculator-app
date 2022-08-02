import { MathSymbol } from './MathSymbol.js';

/**
 * @typedef {import('./MathSymbol').MathSymbol} MathSymbol
 * @typedef {import('./MathSymbol').MathSymbolType} MathSymbolType
 */

export class Expression {
  constructor() {
    this._values = [];
  }

  /**
   * @returns {MathSymbol[]}
   */
  get values() {
    return [...this._values];
  }

  /**
   * @param {string} value
   * @param {MathSymbolType} type
   * @returns {MathSymbol}
   */
  addSymbol(value, type) {
    const digit = new MathSymbol(value, type);
    this._values.push(digit);
    return digit;
  }

  clear() {
    this._values = [];
  }

  /**
   * @returns {MathSymbol}
   */
  removeLastSymbol() {
    return this._values.pop();
  }

  /**
   * @returns {MathSymbol}
   */
  get lastSymbol() {
    const values = this.values;
    return values[values.length - 1];
  }

  /**
   * @returns {boolean}
   */
  hasError() {
    return this.values.some((value) => value.type === 'error');
  }

  /**
   * @returns {boolean}
   */
  isEmpty() {
    return this.values.length === 0;
  }
}
