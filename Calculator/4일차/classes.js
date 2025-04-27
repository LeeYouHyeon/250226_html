/* 숫자(value)와 그 뒤에 오는 연산자(oper)를 클래스로 묶음
  value는 string으로 저장하되, Number() 메서드를 이용해 마지막 MyNumber의 유효성을 매 단계 검사
  value엔 부호를 넣지 않고, 이전 MyNumber나 Expr의 oper, Expr의 firstSign에 저장

  get evaluated : string인 value를 number로 바꿔서 복사
*/
class MyNumber {
  constructor(value, oper) {
    this.value = value;
    this.oper = oper;
  }

  get evaluated() {
    return new MyNumber(Number(this.value), this.oper);
  }
}

/* 괄호를 표현하는 클래스 
  numbers : Expr 내부의 식. MyNumber와 Expr가 들어갈 수 있음
  closed : 이 Expr가 닫혀있는지 확인
  oper : closed == true인 경우 MyNumber처럼 뒤에 연산자가 올 수 있음
  firstSign : Expr.numbers의 첫 요소의 부호. true면 +, false면 minus. 

  get last : Expr의 마지막 숫자
  insert(n) : n을 Expr에 넣는다.
*/
class Expr {
  constructor(firstSign = true) {
    this.numbers = [];
    this.closed = false;
    this.oper = undefined;
    this.firstSign = firstSign;
  }

  get last() {
    return this.numbers[this.numbers.length - 1];
  }

  // n : 연산자, 점(.), 숫자
  // Expr가 닫히지 않은 경우에만 호출됨
  insert(n) {
    // 끝에 닫히지 않은 괄호가 있으면 그곳으로 넘김
    if (this.last instanceof Expr && !this.last.closed) {
      this.last.insert(n);
      return;
    }

    switch (n) {
      // 1. +- : 괄호 안이면 숫자가 없어도 들어갈 수 있음
      case '+': case '-':
        if (this.last == undefined) {
          this.firstSign = (n == '+');
        } else {
          this.last.oper = n;
        }
        break;
      case '×': case '÷': case '%':
        // 2. *, /, % : 괄호 안에 숫자가 있어야만 들어갈 수 있음
        if (this.last != undefined) {
          this.last.oper = n;
        }
        break;
      case '.':
        if (this.last instanceof MyNumber && this.last.oper == undefined) {
          if (!this.last.value.includes('.')) this.last.value += '.';
        } else {
          if (this.last instanceof Expr && this.last.oper == undefined) this.last.oper = '×';
          this.numbers.push(new MyNumber('0.'));
        }
        break;
      default:
        if (this.last instanceof MyNumber && this.last.oper == undefined) {
          this.last.value += n;
        } else {
          if (this.last instanceof Expr && this.last.oper == undefined) this.last.oper = '×';
          this.numbers.push(new MyNumber(n));
        }
    }
  }
}