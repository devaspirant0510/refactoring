const { statement, createStatementData, calculateAmount, earnPoint, USD, totalVolumeCredits } = require("./main");

const invoice = {
  customer: "BigCo",
  performances: [
    { playID: "hamlet", audience: 55 },
    { playID: "as-like", audience: 35 },
    { playID: "othello", audience: 40 },
  ],
};

// ── USD ───────────────────────────────────────────────────────────────────────

describe("USD", () => {
  test("센트 단위 정수를 달러 문자열로 변환한다", () => {
    expect(USD(40000)).toBe("$400.00");
  });

  test("0은 $0.00으로 변환된다", () => {
    expect(USD(0)).toBe("$0.00");
  });

  test("소수점 두 자리까지 표시된다", () => {
    expect(USD(100)).toBe("$1.00");
  });
});

// ── earnPoint ─────────────────────────────────────────────────────────────────

describe("earnPoint", () => {
  test("tragedy: 관객 30명 이하면 포인트 0", () => {
    const perf = { audience: 30, play: { type: "tragedy" } };
    expect(earnPoint(perf)).toBe(0);
  });

  test("tragedy: 관객 30명 초과면 초과분만큼 포인트 적립", () => {
    const perf = { audience: 55, play: { type: "tragedy" } };
    expect(earnPoint(perf)).toBe(25);
  });

  test("comedy: 관객 5명마다 추가 포인트 1점", () => {
    // 35명: 기본 (35-30)=5점 + 보너스 floor(35/5)=7점 = 12점
    const perf = { audience: 35, play: { type: "comedy" } };
    expect(earnPoint(perf)).toBe(12);
  });

  test("comedy: 관객 30명 이하면 보너스만", () => {
    // 20명: 기본 0점 + 보너스 floor(20/5)=4점 = 4점
    const perf = { audience: 20, play: { type: "comedy" } };
    expect(earnPoint(perf)).toBe(4);
  });
});

// ── calculateAmount ───────────────────────────────────────────────────────────

describe("calculateAmount", () => {
  test("tragedy: 관객 30명 이하면 기본 금액 40000", () => {
    const perf = { audience: 30, play: { type: "tragedy" } };
    expect(calculateAmount(perf)).toBe(40000);
  });

  test("tragedy: 관객 30명 초과시 초과분 × 1000 추가", () => {
    // 55명 → 40000 + 25*1000 = 65000
    const perf = { audience: 55, play: { type: "tragedy" } };
    expect(calculateAmount(perf)).toBe(65000);
  });

  test("comedy: 관객 20명 이하면 기본 + 관객수 × 300", () => {
    // 20명: 30000 + 20*300 = 36000
    const perf = { audience: 20, play: { type: "comedy" } };
    expect(calculateAmount(perf)).toBe(36000);
  });

  test("comedy: 관객 20명 초과시 추가 금액 계산", () => {
    // 35명 → 30000 + 10000 + 15*500 + 35*300 = 58000
    const perf = { audience: 35, play: { type: "comedy" } };
    expect(calculateAmount(perf)).toBe(58000);
  });

  test("알 수 없는 장르는 에러를 던진다", () => {
    const perf = { audience: 30, play: { type: "unknown" } };
    expect(() => calculateAmount(perf)).toThrow("알 수 없는 장르");
  });
});

// ── createStatementData (단위 테스트) ─────────────────────────────────────────

describe("createStatementData", () => {
  let data;

  beforeEach(() => {
    data = createStatementData(invoice);
  });

  test("customer 필드가 올바르게 복사된다", () => {
    expect(data.customer).toBe("BigCo");
  });

  test("performances 개수가 동일하다", () => {
    expect(data.performances).toHaveLength(3);
  });

  test("각 performance에 play 정보가 추가된다", () => {
    expect(data.performances[0].play).toEqual({ name: "Hamlet", type: "tragedy" });
    expect(data.performances[1].play).toEqual({ name: "As You Like It", type: "comedy" });
    expect(data.performances[2].play).toEqual({ name: "Othello", type: "tragedy" });
  });

  test("각 performance에 amount가 계산되어 추가된다", () => {
    expect(data.performances[0].amount).toBe(65000); // hamlet 55명
    expect(data.performances[1].amount).toBe(58000); // as-like 35명
    expect(data.performances[2].amount).toBe(50000); // othello 40명
  });

  test("각 performance에 volumeCredits가 계산되어 추가된다", () => {
    expect(data.performances[0].volumeCredits).toBe(25); // hamlet 55명
    expect(data.performances[1].volumeCredits).toBe(12); // as-like 35명
    expect(data.performances[2].volumeCredits).toBe(10); // othello 40명
  });

  test("원본 invoice를 변경하지 않는다 (불변성)", () => {
    expect(invoice.performances[0]).not.toHaveProperty("play");
    expect(invoice.performances[0]).not.toHaveProperty("amount");
    expect(invoice.performances[0]).not.toHaveProperty("volumeCredits");
  });
});

// ── statement (통합 테스트) ───────────────────────────────────────────────────

describe("statement", () => {
  test("청구서 전체 출력 형식이 올바르다", () => {
    const result = statement(invoice);
    expect(result).toContain("청구 내역 (고객명: BigCo)");
    expect(result).toContain("Hamlet");
    expect(result).toContain("As You Like It");
    expect(result).toContain("Othello");
    expect(result).toContain("총액");
    expect(result).toContain("적립 포인트");
  });

  test("총액이 올바르게 계산된다", () => {
    // 65000 + 58000 + 50000 = 173000 → $1,730.00
    const result = statement(invoice);
    expect(result).toContain("$1,730.00");
  });

  test("적립 포인트가 올바르게 계산된다", () => {
    // 25 + 12 + 10 = 47
    const result = statement(invoice);
    expect(result).toContain("47점");
  });
});
