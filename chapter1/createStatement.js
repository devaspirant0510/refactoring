const plays = require("./plays.json");

function createStatementData(invoice) {
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
        throw new Error(`알 수 없는 장르: ${perf.play.type}`);
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

  function totalVolumeCredits(data) {
    return data.performances.reduce((total, perf) => total + perf.volumeCredits, 0);
  }

  function totalAmount(data) {
    return data.performances.reduce((total, perf) => total + perf.amount, 0);
  }

  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    result.amount = calculateAmount(result);
    result.volumeCredits = earnPoint(result);
    return result;
  }

  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;
}

module.exports = { createStatementData };
