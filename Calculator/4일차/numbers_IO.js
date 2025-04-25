// numbers를 수정하는 함수들

// v(연산자, 점(.), 숫자)를 target array에 삽입하고 result를 초기화
// 잘못된 입력은 무시
function insert(v, target = numbers) {
  let last = target[target.length - 1];
  // 열려있는 괄호가 있으면 괄호 안으로 넘김
  if (last instanceof Expr && !last.closed) {
    last.insert(v);
    return;
  }

  switch (v) {
    case '+': case '-': case '×': case '÷': case '%':
      /* 1. 연산자
      1) target이 비어있으면 result가 있을 때만 result 뒤에 붙임
      2) target에 숫자나 닫힌 괄호가 있으면 그것의 oper를 변경
      */
      if (last == undefined) {
        if (result != '') {
          numbers.push(new MyNumber(result, v));
        }
      } else {
        last.oper = v;
      }
      break;
    case '.':
      /* 2. 점
      1) 연산자가 없는 숫자는 점이 없으면 추가
      2) 아니면 새로운 숫자(0.)로 등록하되, 앞이 연산자가 없는 괄호면 곱셈으로 처리
      */
      if (last instanceof MyNumber && last.oper == undefined) {
        if (!last.value.includes('.')) last.value += '.';
      } else {
        if (last instanceof Expr && last.oper == undefined) last.oper = '×';
        target.push(new MyNumber('0.'));
      }
      break;
    default:
      /* 3. 숫자
      1) 연산자가 입력되지 않은 숫자면 그 뒤에 붙임
      2) 아니라면 새로운 숫자로 등록하되, 앞이 연산자가 없는 괄호면 곱셈으로 처리
       */
      if (last instanceof MyNumber && last.oper == undefined) {
        last.value += v;
      } else {
        if (last instanceof Expr && last.oper == undefined) last.oper = '×';
        target.push(new MyNumber(v));
      }
  }

  result = '';
}

// outer(array)의 마지막 요소의 부호 변경
// 연산자와는 별개로 괄호를 통해 구현
function switchSign(outer = numbers) {
  // outer가 비어있으면 괄호 안에 -를 붙임
  if (outer.length == 0) {
    outer.push(new Expr(false));
    return;
  }

  let target = outer[outer.length - 1];
  if (target instanceof Expr) {
    // 1. 맨 마지막이 괄호인 경우
    switch (target.numbers.length) {
      case 0:
        // 1-1. 비어있는 괄호라면 target의 부호에 따라 결정
        // +면 안에 음의 괄호를 넣음
        // -면 outer에서 target을 삭제
        if (target.firstSign) {
          target.numbers.push(new Expr(false));
        } else {
          outer.pop();
        }
        break;
      case 1:
        // 2. target 안에 요소가 하나만 있을 경우
        // 2-1. 그 요소가 괄호면 target 안으로 넘김
        // 2-2. 괄호가 아니면 target의 부호에 따라 변경
        // 2-2-1. +면 첫 요소를 음의 괄호로 감싼다.
        // 2-2-2. -면 target 괄호를 부수고 그 안의 숫자를 outer에 넣음
        if (target.last instanceof Expr) {
          switchSign(target.numbers);
        } else {
          if (target.firstSign) {
            let input = new Expr(false);
            input.numbers.push(target.numbers.pop());
            target.numbers.push(input);
          } else {
            let input = target.last;
            target.numbers.pop();
            outer.pop();
            outer.push(input);
          }
        }
        break;
      default:
        // 3. target에 2개 이상의 요소가 있었다면 안으로 넘김
        switchSign(target.numbers);
    }
  } else {
    // 2. 괄호가 아니면 괄호로 감싸고 음수 부호를 부여
    let input = new Expr(false);
    input.numbers.push(outer.pop());
    outer.push(input);
  }
}

// target(Expr)에 괄호를 넣는 함수
function addBracket(target) {
  // 상황에 따라 Expr를 넣을지 괄호를 닫을지 결정
  if (target.numbers.length == 0) {
    // 1. 비어있다면 새 괄호를 넣음
    target.numbers.push(new Expr());
  } else {
    let last = target.numbers[target.numbers.length - 1];

    if (last instanceof Expr) {
      // 2. last가 괄호라면
      if (last.closed) {
        // 2-1. last가 닫혀있으면 target을 닫음
        target.closed = true;
      } else {
        // 2-2. 닫혀있지 않다면 last로 들어감
        addBracket(last);
      }
    } else {
      // 3. last가 숫자로 끝나면 target을 닫고, 아니라면 새 괄호를 넣음
      if (last.oper == undefined) {
        target.closed = true;
      } else {
        target.numbers.push(new Expr());
      }
    }
  }
}

// 백스페이스
function removeLast(target = numbers) {
  if (target.length == 0) {
    if (result.length > 1) {
      numbers.push(new MyNumber(
        result.substring(0, result.length - 1)
      ));
    }
    result = '';
  } else {
    let last = target[target.length - 1];

    if (last instanceof Expr) {
      if (last.oper != undefined) {
        last.oper = undefined;
      } else if (last.closed) {
        last.closed = false;
      } else if (last.numbers.length == 0) {
        if (last.firstSign) {
          target.pop();
        } else {
          last.firstSign = true;
        }
      } else removeLast(last.numbers);
    } else {
      if (last.oper != undefined) {
        last.oper = undefined;
      } else if (last.value != '') {
        last.value = last.value.substring(0, last.value.length - 1);
        if (last.value == '') {
          target.pop();
        }
      }
    }
  }

  printExpr();
}