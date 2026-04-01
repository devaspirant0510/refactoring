const plays = require("./plays.json");
const invoices = require("./invoices.json");
const { createStatementData } = require("./createStatement");

function playFor(performance) {
  return plays[performance.playID];
}

function calculateAmount(perf) {
  let result = 0;
  switch (perf.play.type) {
    case "tragedy":
      result = 40000;
      if (perf.audience > 30) {
        result += 1000 * (perf.audience - 30);
      }
      break;
    case "comedy":
      result = 30000;
      if (perf.audience > 20) {
        result += 10000 + 500 * (perf.audience - 20);
      }
      result += 300 * perf.audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playFor(perf).type}`);
  }
  return result;
}

function earnPoint(performance) {
  let volumeCredits = 0;
  volumeCredits += Math.max(performance.audience - 30, 0);
  // 희극 관객 5명마다 추가 포인트를 제공한다
  if ("comedy" === performance.play.type) {
    volumeCredits += Math.floor(performance.audience / 5);
  }
  return volumeCredits;
}

function USD(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}


function totalVolumeCredits(invoice) {
  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    volumeCredits += perf.volumeCredits;
  }
  return volumeCredits;
}

function atotalAmount(invoice) {

  let totalAmount = 0;
  for (let perf of invoice.performances) {
    totalAmount += perf.amount;
  }
  return totalAmount;
}

function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  for (let perf of data.performances) {
    result += ` ${perf.play.name}: ${USD(perf.amount)} (${perf.audience}석)\n`;
  }
  result += `총액: ${USD(data.totalAmount)}\n`;
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
  return result;
}

function textStatement(invoice) {
  return renderPlainText(createStatementData(invoice));
}

function rednerHtml(data){
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
  result += "<table>\n";
  result += "<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>\n";
  for (let perf of data.performances) {
    result += `<tr><td>${perf.play.name}</td><td>${perf.audience}</td><td>${USD(perf.amount)}</td></tr>\n`;
  }
  result += "</table>\n";
  result += `<p>총액: <em>${USD(data.totalAmount)}</em></p>\n`;
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;
  return result;
}
function htmlStatement(invoice) {
  return rednerHtml(createStatementData(invoice));
}

console.log(htmlStatement(invoices[0]));
console.log(textStatement(invoices[0]));

module.exports = { textStatement, htmlStatement };
