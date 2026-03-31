/* eslint-disable no-fallthrough */
const plays = require("./plays.json");
const invoices = require("./invoices.json");

function calculateAmount(playType, audience) {
  let thisAmount = 0;
  switch (playType) {
    case "tragedy":
      thisAmount = 40000;
      if (audience > 30) {
        thisAmount += 1000 * (audience - 30);
      }
      break;
    case "comedy":
      thisAmount = 30000;
      if (audience > 20) {
        thisAmount += 10000 + 500 * (audience - 20);
      }
      thisAmount += 300 * audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${play.type}`);
  }
  return thisAmount;
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


function statement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let thisAmount = 0;
    thisAmount = calculateAmount(play.type, perf.audience);

    // 포인트를 적립한다
    volumeCredits += earnPoint(play.type, perf.audience);

    // 청구 내역을 출력한다
    result += ` ${play.name}: ${format(thisAmount / 100)} (${perf.audience}석)\n`;
    totalAmount += thisAmount;
  }

  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

console.log(statement(invoices[0], plays));

module.exports = { statement };
