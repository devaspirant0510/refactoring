import playsData from "./plays.json";

export type PlayType = "tragedy" | "comedy";

export interface Play {
  name: string;
  type: PlayType;
}

export interface Performance {
  playID: string;
  audience: number;
}

export interface EnrichedPerformance extends Performance {
  play: Play;
  amount: number;
  volumeCredits: number;
}

export interface Invoice {
  customer: string;
  performances: Performance[];
}

export interface StatementData {
  customer: string;
  performances: EnrichedPerformance[];
  totalAmount: number;
  totalVolumeCredits: number;
}

type Plays = Record<string, Play>;
const plays = playsData as Plays;

class PerformanceCalculator {
  performance: Performance;
  play: Play;

  constructor(aPerformance: Performance, aPlay: Play) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount(): number {
    throw new Error(`서브클래스에서 구현해야 합니다: ${this.play.type}`);
  }

  get volumeCredits(): number {
    return Math.max(this.performance.audience - 30, 0);
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount(): number {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }

  get volumeCredits(): number {
    // 희극 관객 5명마다 추가 포인트를 제공한다
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

function createPerformanceCalculator(
  aPerformance: Performance,
  aPlay: Play
): PerformanceCalculator {
  switch (aPlay.type) {
    case "tragedy": return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":  return new ComedyCalculator(aPerformance, aPlay);
    default: throw new Error(`알 수 없는 장르: ${aPlay.type}`);
  }
}

export function createStatementData(invoice: Invoice): StatementData {
  function playFor(aPerformance: Performance): Play {
    return plays[aPerformance.playID];
  }

  function enrichPerformance(aPerformance: Performance): EnrichedPerformance {
    const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
    const result = Object.assign({}, aPerformance) as EnrichedPerformance;
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  const performances = invoice.performances.map(enrichPerformance);
  return {
    customer: invoice.customer,
    performances,
    totalAmount: performances.reduce((total, perf) => total + perf.amount, 0),
    totalVolumeCredits: performances.reduce((total, perf) => total + perf.volumeCredits, 0),
  };
}
