const fs = require("fs");
const path = require("path");
/*


 */
/**
 *
 *
 * @param invoice 청구서 데이터
 * @param plays 공연하는 연극 정보
 */
function statement(invoice,plays){
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `청구내역 ( 고객명 :${invoice.customer})\n`

    const format = new Intl.NumberFormat("en-US",
        {
            style: "currency", currency: "USD",
            minimumFractionDigits: 2
        }).format;
    for(let perf of invoice.performances){
        const play = plays[perf.playID];
        let thisAmount = 0;
        //  공연 규모애따라 추가금액을 받음
        switch (play.type){
            case "tragedy":
                thisAmount = 40000;
                if(perf.audience>30){
                    thisAmount+=1000*(perf.audience-30);
                }
                break;
            case "comedy":
                thisAmount = 30000;
                if(perf.audience>20){
                    thisAmount+=10000+500*(perf.audience-20);
                }
                thisAmount+=300*perf.audience;
                break;
            default:
                throw new Error(`알수없는 장르 ${play.type}`);

        }
        // 특정인원수 이상을 넘기면 적립포인트
        volumeCredits+=Math.max(perf.audience-30,0);
        if(play.type==="comedy"){
            volumeCredits+=Math.floor(perf.audience/5);
        }
        result+=` ${play.name}: ${format(thisAmount/100)} (${perf.audience}석 )\n`;
        totalAmount+=thisAmount;
    }
    result+=`총액 : ${format(totalAmount/100)}\n`;
    result+=`적립포인트 : ${volumeCredits}\n`;
    return result;
}
const invoice = JSON.parse(fs.readFileSync(path.join(__dirname,"invoices.json")).toString());
const plays = JSON.parse(fs.readFileSync(path.join(__dirname,"plays.json")).toString());
const result = statement(invoice[0],plays);
console.log(result)