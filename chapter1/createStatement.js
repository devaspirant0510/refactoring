const plays = require("./plays.json");

class Calculator {
  compute(audience) {
    throw new Error("서브클래스에서 구현해야 합니다.");
  }
  earnPoint(audience) {
    return Math.max(audience - 30, 0);
  }
}

class TragedyCalculator extends Calculator {
  compute(audience) {
    let result = 40000;
    if (audience > 30) {
      result += 1000 * (audience - 30);
    }
    return result;
  }

}

class ComedyCalculator extends Calculator {
  compute(audience) {
    let result = 30000;
    if (audience > 20) {
      result += 10000 + 500 * (audience - 20);
    }
    result += 300 * audience; // 기본 요금
    return result;
  }
  earnPoint(audience) {
    return super.earnPoint(audience) + Math.floor(audience / 5);
  }
}
function calculatorFactory(type) {
  switch (type) {
    case "tragedy":
      return new TragedyCalculator();
    case "comedy":
      return new ComedyCalculator();
    default:
      throw new Error(`알 수 없는 장르: ${type}`);
  }
}
function createStatementData(invoice) {
  function playFor(performance) {
    return plays[performance.playID];
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
    const calculator = calculatorFactory(result.play.type);
    result.amount = calculator.compute(result.audience);
    result.volumeCredits = calculator.earnPoint(result.audience);
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
