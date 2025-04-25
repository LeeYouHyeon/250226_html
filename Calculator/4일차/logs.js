//로그 관련

document.querySelector('.logBtn').onclick = () => {
  document.querySelector('.logs').classList.toggle('invisible');
};

// 로그 출력
function printLogs() {
  let inputHTML = '<button type="button" onclick="removeLogs()">계산기록 삭제</button>';
  for (const log of logs) {
    inputHTML += `<li>${log}</li>`;
  }

  if (logs.length == 0) inputHTML = '기록이 없습니다.';
  document.querySelector('.logs').innerHTML = inputHTML;
}

// 로그 삭제
function removeLogs() {
  logs.splice(0, logs.length);
  printLogs();
}