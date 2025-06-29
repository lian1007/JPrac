function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ========== 未作答警告 ========== */
function showAlert(msg) {
  document.getElementById('alert-msg').innerText = msg;
  document.getElementById('custom-alert').classList.remove('hide');
}

document.getElementById('alert-close').addEventListener('click', () => {
  document.getElementById('custom-alert').classList.add('hide');
});

/* ========== 完成作答訊息 ========== */
function showComplete() {
  document.getElementById('complete-box').classList.remove('hide');
}

document.getElementById('retry').addEventListener('click', () => {
  location.reload();
});

document.getElementById('backHome').addEventListener('click', () => {
  location.href = '../index.html';
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
    const total = Math.min(5, shuffled.length);
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

      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';

      const submitBtn = document.createElement('button');
      submitBtn.className = 'icon-btn';
      submitBtn.title = '送出';
      submitBtn.innerHTML = `<img src="icons/check.png" alt="送出" width="20" height="20">`;

      const clearBtn = document.createElement('button');
      clearBtn.className = 'icon-btn';
      clearBtn.title = '清除';
      clearBtn.id = 'clears';
      clearBtn.innerHTML = `<img src="icons/bin.png" alt="清除" width="20" height="20">`;

      const resultSpan = document.createElement('span');
      resultSpan.className = 'result-text';

      if (index === selected.length - 1) {
        // 最後一題
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

          // 檢查所有題目結果
          const allCorrect = [
            ...document.querySelectorAll('.result-text'),
          ].every((r) => r.innerText === '✅');

          if (allCorrect) {
            showComplete();
          }
        });
      } else {
        // 普通題送出按鈕
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
        });
      }

      clearBtn.addEventListener('click', () => {
        selectedAns = '';
        const optionBtns = optionsDiv.querySelectorAll('button');
        optionBtns.forEach((btn) => btn.classList.remove('selected'));
        resultSpan.innerText = '';
      });

      btnGroup.appendChild(submitBtn);
      btnGroup.appendChild(clearBtn);
      btnGroup.appendChild(resultSpan);

      container.appendChild(btnGroup);
      quizArea.appendChild(container);
    });
  })
  .catch((err) => console.error('載入題目失敗', err));
