// 메인 컨트롤과 수식 계산 담당

// 메인 컨트롤
document.querySelector('.buttons').addEventListener('click', e => {
  try {
    switch (e.target.value) {
      case undefined:
        // 입력 미스는 무시
        return;
      case '=':
        // 완성된 수식을 계산한 후 로그로 이관하되, 숫자나 괄호가 하나만 있는 경우 무시
        if (countNums() <= 1) return;
        result = String(calculate(numbers)); // 편의상 String으로 저장
        logs.unshift(str(numbers.splice(0, numbers.length), true) + ' = ' + result);
        printLogs();
        break;
      case 'C':
        // numbers 초기화
        result = '';
        numbers.splice(0, numbers.length);
        break;
      case '()':
        /* 괄호(Expr) 추가
          1. 마지막이 열려있는 괄호면 addBracket()에서 처리
          2. 아니라면 괄호를 새로 추가하되, 이하의 경우 추가적인 처리가 들어간다.
            1) 수식이 비어있으면 MyNumber(result, *)을 앞에 넣음
            2) 앞 요소에 연산자가 없으면 곱셈으로 처리
        */
        let last = numbers[numbers.length - 1];
        if (last instanceof Expr && !last.closed) {
          addBracket(last);
        } else {
          if (last == undefined) {
            if (result != '') {
              numbers.push(new MyNumber(result, '×'));
              result = '';
            }
          } else if (last.oper == undefined) last.oper = '×';

          numbers.push(new Expr());
        }
        break;
      case '+/-':
        /* 부호 변경
          1. numbers와 result가 비어있으면 Expr(false)를 추가
          2. 아니라면 switchSign()으로 넘어가되, numbers가 비어있으면 result를 numbers로 옮기고 넘어감
        */
        if (numbers.length == 0) {
          if (numbers == '') {
            numbers.push(new Expr(false));
            break;
          }

          numbers.push(new MyNumber(result));
          result = '';
        }
        switchSign();
        break;
      default:
        // 연산자, ., 숫자는 수식에 추가. 재귀 요소가 있어서 별도 함수로 분리
        insert(e.target.value);
    }

    printExpr();
  } catch (error) { // 에러 처리
    alert(error.message);
    console.log(error);
  }
});

// 값을 계산해서 숫자로 return
// zeroDivide나 incomplete 에러가 나올 수 있음 => 메인 컨트롤에서 처리
// numbers는 calculate 이후에도 그대로 있으므로 별도로 초기화해줘야 함
// lastOper는 Expr가 calculate를 부를 때 처리
function calculate(target, lastOper, firstSign = true) {
  // numCopy : numbers에서 Expr을 전부 Number로 바꿔서 복사
  let numCopy = [], answer;
  for (let number of target) {
    if (number instanceof Expr) {
      if (number.numbers.length == 0) {
        throw incomplete;
      }
      numCopy.push(new yNumber(calculate(number.numbers, number.last.oper, number.firstSign), number.oper));
    } else {
      numCopy.push(number.evaluated);
    }
  }

  if (numCopy.length == 0) return;

  // 첫 숫자가 음수인지 체크한 후 반영
  if (!firstSign) {
    numCopy[0].value *= -1;
  }

  if (numCopy.length == 1) {
    // 숫자가 하나뿐이면 계산 과정을 스킵
    answer = numCopy[0];
  } else {
    // *, /, % 계산
    // zeroDivide 에러가 나올 수 있음
    let afterMD = [], last = numCopy[0], item;
    for (let i = 1; i < numCopy.length; i++) {
      item = numCopy[i];
      switch (last.oper) {
        case '×':
          last.value *= item.value;
          last.oper = item.oper;
          break;
        case '÷':
          if (item.value == 0) {
            throw zeroDivide;
          }
          last.value /= item.value;
          last.oper = item.oper;
          break;
        case '%':
          if (item.value == 0) {
            throw zeroDivide;
          }
          last.value %= item.value;
          last.oper = item.oper;
          break;
        default:
          afterMD.push(last);
          last = item;
      }

      if (i == numCopy.length - 1) {
        afterMD.push(last);
      }
    }

    // +- 계산
    answer = afterMD.shift();
    while (afterMD.length > 0) {
      let item = afterMD.shift();
      if (answer.oper == '+') answer.value += item.value;
      else answer.value -= item.value;
      answer.oper = item.oper;
    }
  }

  if (answer.oper != lastOper) throw incomplete;
  return answer.value;
}

// target(array)에 숫자 + 괄호가 몇 개 있는가
function countNums(target = numbers) {
  let answer = 0;
  for (const item of target) {
    if (item instanceof Expr) {
      answer += countNums(item.numbers) + 1;
    } else {
      answer++;
    }
  }

  return answer;
}