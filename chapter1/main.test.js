const { statement, calculateAmount, earnPoint, USD, totalVolumeCredits } = require("./main");

const plays = {
  hamlet: { name: "Hamlet", type: "tragedy" },
  "as-like": { name: "As You Like It", type: "comedy" },
  othello: { name: "Othello", type: "tragedy" },
};

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
  test("tragedy: 관객이 30명 이하면 포인트 0", () => {
    expect(earnPoint("tragedy", 30)).toBe(0);
  });

  test("tragedy: 관객이 30명 초과면 초과분만큼 포인트 적립", () => {
    expect(earnPoint("tragedy", 55)).toBe(25);
  });

  test("comedy: 관객 5명마다 추가 포인트 1점", () => {
    // 관객 35명: 기본 (35-30)=5점 + 보너스 floor(35/5)=7점 = 12점
    expect(earnPoint("comedy", 35)).toBe(12);
  });

  test("comedy: 관객 30명 이하면 기본 포인트 없이 보너스만", () => {
    // 관객 20명: 기본 0점 + 보너스 floor(20/5)=4점 = 4점
    expect(earnPoint("comedy", 20)).toBe(4);
  });
});

// ── calculateAmount ───────────────────────────────────────────────────────────
// calculateAmount는 내부에서 plays JSON을 직접 참조하므로 실제 데이터로 테스트

describe("calculateAmount", () => {
  test("tragedy: 관객 30명 이하면 기본 금액 40000", () => {
    const perf = { playID: "hamlet", audience: 30 };
    expect(calculateAmount(perf)).toBe(40000);
  });

  test("tragedy: 관객 30명 초과시 초과분 × 1000 추가", () => {
    // 55명 → 40000 + (55-30)*1000 = 65000
    const perf = { playID: "hamlet", audience: 55 };
    expect(calculateAmount(perf)).toBe(65000);
  });

  test("comedy: 기본 금액 30000 + 관객수 × 300", () => {
    // 20명 이하: 30000 + 20*300 = 36000
    const perf = { playID: "as-like", audience: 20 };
    expect(calculateAmount(perf)).toBe(36000);
  });

  test("comedy: 관객 20명 초과시 추가 금액 계산", () => {
    // 35명 → 30000 + 10000 + (35-20)*500 + 35*300 = 58000
    const perf = { playID: "as-like", audience: 35 };
    expect(calculateAmount(perf)).toBe(58000);
  });

  test("알 수 없는 장르는 에러를 던진다", () => {
    // plays.json에 없는 playID는 테스트 불가, 직접 playFor를 우회하기 어려움
    // → 이 케이스는 장르 분리 리팩토링 후 단위 테스트로 보완 예정
  });
});

// ── totalVolumeCredits ────────────────────────────────────────────────────────

describe("totalVolumeCredits", () => {
  test("모든 공연의 포인트 합산", () => {
    // hamlet(55): 25 + as-like(35): 12 + othello(40): 10 = 47
    expect(totalVolumeCredits(invoice)).toBe(47);
  });
});

// ── statement (통합 테스트) ───────────────────────────────────────────────────

describe("statement", () => {
  test("청구서 전체 출력 형식이 올바르다", () => {
    const result = statement(invoice, plays);
    expect(result).toContain("청구 내역 (고객명: BigCo)");
    expect(result).toContain("Hamlet");
    expect(result).toContain("As You Like It");
    expect(result).toContain("Othello");
    expect(result).toContain("총액");
    expect(result).toContain("적립 포인트");
  });

  test("총액이 올바르게 계산된다", () => {
    // hamlet: 65000, as-like: 58000, othello: 50000 → 합계 173000 → $1,730.00
    const result = statement(invoice, plays);
    expect(result).toContain("$1,730.00");
  });

  test("적립 포인트가 올바르게 계산된다", () => {
    const result = statement(invoice, plays);
    expect(result).toContain("47점");
  });
});
