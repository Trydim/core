"use strict";

// Печать Отчетов для навесов
// загрузка картики фермы
export const publicFunction = {

  printReport: (report, number) => {
    let table = f.gTNode('#printTable'),
        html = '';

    Object.values(report).map(i => {
      html += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td></tr>`;
    });

    if (number) table.querySelector('#number').innerHTML = number.toString();
    else table.querySelector('#numberWrap').classList.add(f.CLASS_NAME.HIDDEN_NODE);
    table.querySelector('tbody').innerHTML = html;
    return table.outerHTML;
  }

}

if (window.f) {
  // печать отчета
  f.printReport = publicFunction.printReport;
}
