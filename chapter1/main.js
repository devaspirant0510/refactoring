/* eslint-disable no-fallthrough */
const plays = require("./plays.json");
const invoices = require("./invoices.json");

function playFor(performance) {
  return plays[performance.playID];
}

function calculateAmount(perf) {
  let result = 0;
  switch (playFor(perf).type) {
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

function earnPoint(playType, audience) {
  let volumeCredits = 0;
  volumeCredits += Math.max(audience - 30, 0);
  // 희극 관객 5명마다 추가 포인트를 제공한다
  if ("comedy" === playType) {
    volumeCredits += Math.floor(audience / 5);
  }
  return volumeCredits;
}
function USD(aNumber){
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(aNumber / 100);
}


function totalVolumeCredits(invoice) {
  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    volumeCredits += earnPoint(playFor(perf).type, perf.audience);
  }
  return volumeCredits;
}

function atotalAmount(invoice) {
  let totalAmount = 0;
  for (let perf of invoice.performances) {
    totalAmount += calculateAmount(perf);
  }
  return totalAmount;
}

function statement(invoice) {
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  for (let perf of invoice.performances) {
    result += ` ${playFor(perf).name}: ${USD(calculateAmount(perf))} (${perf.audience}석)\n`;
  }
  result += `총액: ${USD(atotalAmount(invoice))}\n`;
  result += `적립 포인트: ${totalVolumeCredits(invoice)}점\n`;
  return result;
}

console.log(statement(invoices[0]));

module.exports = { statement, calculateAmount, earnPoint, USD, totalVolumeCredits };
