function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function showAlert(msg) {
  document.getElementById('alert-msg').innerText = msg;
  document.getElementById('custom-alert').classList.remove('hide');
}

document.getElementById('alert-close').addEventListener('click', () => {
  document.getElementById('custom-alert').classList.add('hide');
});

const lessonFile = getParam('lesson') || 'L3.json';
const quizArea = document.getElementById('quiz-area');

fetch(lessonFile)
  .then((res) => res.json())
  .then((quizData) => {
    console.log(quizData.length);

    // 只洗一次，抽出 20 題
    const shuffled = quizData.sort(() => Math.random() - 0.5);
    const total = Math.min(20, shuffled.length);
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
      submitBtn.innerHTML = `<img src="../icons/check.png" alt="送出" width="20" height="20">`;

      const clearBtn = document.createElement('button');
      clearBtn.className = 'icon-btn';
      clearBtn.title = '清除';
      clearBtn.id = 'clears';
      clearBtn.innerHTML = `<img src="../icons/bin.png" alt="清除" width="20" height="20">`;

      const resultSpan = document.createElement('span');
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
      });

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
