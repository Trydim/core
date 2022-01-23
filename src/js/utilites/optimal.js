'use strict'

/**
 * @param {*} message
 * @param {string} name (key of object)
 */

function UserException(message, name) {
  const names = {
    values: 'Массив входящих данных',
    leftovers: 'Стандартные длины',
    cutW: 'Ширина реза',
    added: 'Добавочная ширина',
  }
  this.message = message;
  this.name = names[name];
}

/**
 * @param {object} options
 * -----input------
 * name - имя объекта, можно оставить пустым
 * values - массив, содержащий только целочисленные положительные значения, значение 0 будет проигнорировано(если числа дробные, то массив нужно подготовить)
            это, напрмер, размеры для раскроя (нельзя отавить пустым)
 * leftovers - возможны 2 варианта:
            1. Целое положительное число - алгоритм будет выбирать числа из values чтобы максимально приблизиться к этому числу
              пока не будет выбраны все числа из values. На выходе будет массив, содержащий массивы с выбранными числами(сумма не превышает leftovers)
            2. Массив целых положительных чисел - алгоритм будет проходиться по каждому из этих чисел и выбирать числа из values пока не пройдется по всем числам
              из массива leftovers. на выходе будет массив остатка values, если не будут выбраны все и массив остатка leftovers если остаток из массива
              values не возможно вместить в остаток leftovers.
 * cutW - целое положительное число, ширина реза, по умолчанию 0
 * added - целое положительное число, добавочная длина, например если при раскрое реек они режутся не под 90 градусов, по умолчанию 0
 * minRemain - целое положительное число,минимально учитываемый остаток, остатки меньше этого числа не будут в выходном массиве остатков.
 * ----output-------
 * name: переданное имя
 * list: список итоговых массивов с числами
 * cutWidth: переданна ширина реза или 0
 * added: переданная добавочная длина или 0
 * remainOfValues: массив остатков входного массива values если его не возможно вместить в остатки массива leftovers (leftovers вариант 2) или пустой массив если остатков нет
 * remainOfLeftovers: массив остатков(если есть) из одного числа (leftovers вариант 1) либо массив остатков leftovers (вариант 2) или пустой массив
 ---use---
 const cutting = new optimal({
        values: [3,6,5,7,1],
        leftovers: [15],
      }).getData();
 */

export function optimal(options) {
  const init = () => {
    ({
      name     : this.name      = '',
      values   : this.values    = false,
      leftovers: this.leftovers = false,
      cutW     : this.cutW      = 0,
      added    : this.added     = 0,
      minRemain: this.minRemain = 0,
    } = options);

    this.list = [];
    procedure();
  }

  const throwErrors = () => {
    if (!this.values.length)
      throw new UserException('Не является масивом', 'values');
    if (this.values.find(e => Number.isNaN(+e) || e % 1 > 0))
      throw new UserException('Массив не должен содержать дробные числа или текст', 'values');
    if (this.values.find(e => +e < 0))
      throw new UserException('Массив содержит отрицательные числа', 'values');
    if (this.values.find(e => +e > this.leftovers))
      throw new UserException('В массиве содержатся числа выше целевой длины', 'values');
    if (!this.leftovers.length && (Number.isNaN(+this.leftovers) || +this.leftovers <= 0))
      throw new UserException('Целевая длина не является числом или массивом или <= 0', 'leftovers');
    if (this.leftovers.length && this.leftovers.find(e => Number.isNaN(+e) || e % 1 > 0))
      throw new UserException('Массив не должен содержать дробные числа или текст', 'leftovers');
    if (this.cutW.length || Number.isNaN(+this.cutW))
      throw new UserException('Ширина реза не является числом', 'cutW');
    if (+this.cutW < 0)
      throw new UserException('Ширина реза не может быть отрицательным числом', 'cutW');
    if (this.cutW % 1 > 0)
      throw new UserException('Ширина реза не может быть дробным числом', 'cutW');
    if (this.added.length || Number.isNaN(+this.added))
      throw new UserException('Добавочная длина не является числом', 'added');
    if (+this.added < 0)
      throw new UserException('Добавочная длина может быть отрицательным числом', 'added');
    if (this.added % 1 > 0)
      throw new UserException('Добавочная длина не может быть дробным числом', 'added');
  }

  const prepareData = () => {
    this.cutW = +this.cutW;
    this.added = +this.added;
    this.values = [0].concat(this.values.filter(e => +e > 0).map(e => +e + this.cutW).sort((a, b) => b - a)); //здесь же к каждой рейке добавляем ширину реза, далее одна лишняя отнимется от длины самой рейки
    if (!this.leftovers.length) this.leftovers = [+this.leftovers + this.cutW - this.added];
    else this.leftovers = this.leftovers.map(e => +e + this.cutW - this.added);
  }

  const calc = () => {
    let iteration = 0, remainLeftOvers = this.leftovers;
    while (this.leftovers.length > 1 ? iteration < this.leftovers.length : this.values.length > 1) {
      let table = [], sum, res = [], delIndex = [];
      //начинаем заполнять таблицу (первая строка и первый столбец)
      table.push([1]);
      for (let i = 1; i <= this.leftovers[iteration]; i++) table[0].push(0);
      for (let i = 1; i <= this.values.length - 1; i++) table.push([1]);
      //остальные значения таблицы
      for (let i = 1; i <= this.values.length - 1; i++) {
        for (let j = 1; j <= this.leftovers[iteration]; j++) {
          if (j >= this.values[i]) {
            if (table[i - 1][j] > table[i - 1][j - this.values[i]]) table[i][j] = table[i - 1][j];
            else table[i][j] = table[i - 1][j - this.values[i]];
          } else table[i][j] = table[i - 1][j];
        }
      }
      //поиск...
      for (let i = this.leftovers[iteration]; i >= 1; i--) {
        sum = i;
        if (table[this.values.length - 1][i] === 1) {
          for (let j = this.values.length - 1; j >= 1; j--) {
            if (table[j][sum] !== table[j - 1][sum]) {
              sum -= this.values[j];
              delIndex.push(j);
              res.push(this.values[j] - this.cutW);
              this.leftovers.length > 1 ? remainLeftOvers[iteration] -= this.values[j] : '';
            }
          }
          break;
        }
      }
      this.leftovers.length > 1 && iteration++;
      delIndex.forEach(e => this.values.splice(e, 1));
      this.list.push(res);
    }
    this.remainOfValues = this.values.filter(e => e > 0).map(e => e - this.cutW);
    this.remainOfLeftovers = remainLeftOvers.filter(e => e >= this.minRemain);
  }

  function procedure() {
    throwErrors();
    prepareData();
    calc();
  }

  this.getData = () => {
    const result = {
      name: this.name,
      list: this.list,
      cutWidth: this.cutW,
      added: this.added,
    }
    if (this.leftovers.length > 1) {
      result.remainOfValues = this.remainOfValues;
      result.remainOfLeftovers = this.remainOfLeftovers;
    } else {
      const lastIndex = this.list.length - 1,
            lengthItem = this.list[lastIndex].length,
            calc = this.list[lastIndex].reduce((acc, curr) => acc += curr);
      result.remainOfValues = [];
      result.remainOfLeftovers = this.leftovers[0] - calc - (this.cutW * lengthItem) - this.added;
    }
    return result;
  }

  init();

  return {getData: this.getData};
}
