// 출력 관련 함수들

// 수식이나 결과를 .expression과 .intermediate에 출력
function printExpr() {
  let input = '';
  if (numbers.length == 0) {
    input = result;
  } else {
    input += str();
    result = '';
  }

  document.querySelector('.expression').innerText = input;

  const inter = document.querySelector('.intermediate');
  try {
    const interV = calculate(numbers);
    if (interV == undefined || isNaN(interV)) throw new Error();
    inter.innerText = interV;
  } catch {
    inter.innerText = '';
  }
}

// item(array, MyNumber, Expr)을 string으로 반환
// 로그로 등록할 땐 isLog = true를 넣으며, 이 땐 무조건 괄호를 닫음
function str(item = numbers, isLog = false) {
  let answer = '';
  if (item instanceof Expr) {
    answer += item.firstSign ? '(' : '(-';
    for (let inner of item.numbers) {
      answer += str(inner, isLog);
    }
    if (item.closed || isLog) {
      answer += ')';
      if (item.oper != undefined) answer += item.oper;
    }
  } else if (Array.isArray(item)) {
    for (let inner of item) {
      answer += str(inner, isLog);
    }
  } else {
    answer += item.value;
    if (item.oper != undefined) answer += item.oper;
  }

  return answer;
}