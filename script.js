// script.js - for test.html
// 功能：處理題庫載入、出題、答題判斷、顯示未答提示、完成視窗、重試與回首頁
// 說明：
//  - 從 URL 讀取 lesson & mode (範例: ?lesson=book1/words/L1.json&mode=word)
//  - 如果 lesson 沒有 book1/ 前綴，會自動補上 'book1/'
//  - 完成全部題目後會呼叫 window.saveTodayAttempt()（若該函式存在於全域）
//  - 需配合 test.html 裡的 #quiz-area, #custom-alert (#alert-msg, #alert-close), #complete-box (#retry, #backHome), #page-title 等 DOM 元素

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ========== 未作答警告 ========== */
function showAlert(msg) {
  document.getElementById('alert-msg').innerText = msg;
  document.getElementById('custom-alert').classList.remove('hide');
  document.getElementById('alert-close').focus(); // 🔹 自動聚焦按鈕
}

document.getElementById('alert-close').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('custom-alert').classList.add('hide');
  }
});

/* ========== 完成作答訊息 ========== */
function showComplete() {
  document.getElementById('complete-box').classList.remove('hide');
  saveTodayAttempt(); // ⬅️ 記錄今天的測驗次數
}

document.getElementById('retry').addEventListener('click', () => {
  location.reload();
});

document.getElementById('backHome').addEventListener('click', () => {
  location.href = 'index.html';
});

const params = new URLSearchParams(window.location.search);
const lessonFile = params.get('lesson') || 'L1.json';
const mode = params.get('mode') || 'sentence'; // 預設句型，單字傳 mode=word

document.getElementById('page-title').innerText =
  mode === 'word' ? '單字練習' : '文法練習';
const quizArea = document.getElementById('quiz-area');

fetch(lessonFile)
  .then((res) => res.json())
  .then((quizData) => {
    console.log(quizData.length);

    // 只洗一次，抽出 X 題
    const shuffled = quizData.sort(() => Math.random() - 0.5);
    const total = Math.min(6, shuffled.length);
    const selected = shuffled.slice(0, total);

    console.log(selected.length); // 應固定 20

    selected.forEach((item, index) => {
      const container = document.createElement('div');
      container.className = 'question-block';

      const p = document.createElement('p');
      p.innerHTML = `${index + 1}. ${item.q}`;
      container.appendChild(p);

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';

      let selectedAns = '';

      let btnGroup, submitBtn, clearBtn, resultSpan;

      // ========== 中翻日 ==========

      if (mode === 'dict') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '請輸入日文平假/片假名';
        input.className = 'inputtext';
        container.appendChild(input);

        // 新增 Enter 送出邏輯
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitBtn.click();
          }
        });

        btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        submitBtn = document.createElement('button');
        submitBtn.className = 'icon-btn';
        submitBtn.title = '送出';
        submitBtn.innerHTML = `<img src="icons/check.png" alt="送出" width="20" height="20">`;

        clearBtn = document.createElement('button');
        clearBtn.className = 'icon-btn';
        clearBtn.id = 'clears';
        clearBtn.title = '清除';
        clearBtn.innerHTML = `<img src="icons/bin.png" alt="清除" width="20" height="20">`;

        resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';

        submitBtn.addEventListener('click', () => {
          selectedAns = input.value.trim();
          if (selectedAns === '') {
            showAlert('請先輸入答案！');
            return;
          }

          const answers = Array.isArray(item.answer)
            ? item.answer
            : [item.answer];

          if (answers.includes(selectedAns)) {
            resultSpan.innerText = '✅';
            resultSpan.style.color = 'green';
          } else {
            resultSpan.innerText = `❌ 正確答案：${answers.join(' 或 ')}`;
            resultSpan.style.color = 'red';
          }

          // 最後一題檢查
          if (index === selected.length - 1) {
            const allCorrect = [
              ...document.querySelectorAll('.result-text'),
            ].every((r) => r.innerText === '✅');
            if (allCorrect) {
              showComplete();
            }
          }
        });

        clearBtn.addEventListener('click', () => {
          input.value = '';
          resultSpan.innerText = '';
        });
      } else {
        /* --------非中翻日文 --------*/

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        item.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.innerText = opt;
          btn.addEventListener('click', () => {
            selectedAns = opt;
            const optionBtns = optionsDiv.querySelectorAll('button');
            optionBtns.forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
          optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);

        btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        submitBtn = document.createElement('button');
        submitBtn.className = 'icon-btn';
        submitBtn.title = '送出';
        submitBtn.innerHTML = `<img src="icons/check.png" alt="送出" width="20" height="20">`;

        clearBtn = document.createElement('button');
        clearBtn.className = 'icon-btn';
        clearBtn.title = '清除';
        clearBtn.id = 'clears';
        clearBtn.innerHTML = `<img src="icons/bin.png" alt="清除" width="20" height="20">`;

        resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';

        submitBtn.addEventListener('click', () => {
          if (selectedAns === '') {
            showAlert('請先選擇答案！');
            return;
          }
          if (selectedAns === item.answer) {
            resultSpan.innerText = '✅';
            resultSpan.style.color = 'green';
          } else {
            resultSpan.innerText = `❌ 正確答案：${item.answer}`;
            resultSpan.style.color = 'red';
          }
          // 最後一題檢查
          if (index === selected.length - 1) {
            const allCorrect = [
              ...document.querySelectorAll('.result-text'),
            ].every((r) => r.innerText === '✅');
            if (allCorrect) {
              showComplete();
            }
          }
        });

        clearBtn.addEventListener('click', () => {
          selectedAns = '';
          const optionBtns = optionsDiv.querySelectorAll('button');
          optionBtns.forEach((btn) => btn.classList.remove('selected'));
          resultSpan.innerText = '';
        });
      }

      btnGroup.appendChild(submitBtn);
      btnGroup.appendChild(clearBtn);
      btnGroup.appendChild(resultSpan);

      container.appendChild(btnGroup);
      quizArea.appendChild(container);
    });
  })
  .catch((err) => console.error('載入題目失敗', err));
