function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const lessonFile = getParam('lesson') || 'L1.json';
const quizArea = document.getElementById('quiz-area');

fetch(lessonFile)
  .then((res) => res.json())
  .then((quizData) => {
    quizData.forEach((item, index) => {
      const container = document.createElement('div');
      container.className = 'question-block';

      const p = document.createElement('p');
      p.innerHTML =
        `${index + 1}. ` +
        item.q.replace('＿＿＿', `<span id="blank-${index}">_____</span>`);
      container.appendChild(p);

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';

      let currentAns = '';

      item.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.addEventListener('click', () => {
          currentAns += opt;
          document.getElementById(`blank-${index}`).innerText =
            currentAns || '_____';
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
      clearBtn.innerHTML = `<img src="../icons/bin.png" alt="清除" width="20" height="20">`;

      const resultSpan = document.createElement('span');
      resultSpan.className = 'result-text';

      submitBtn.addEventListener('click', () => {
        if (currentAns === '') {
          alert('請先選擇答案！');
          return;
        }
        if (currentAns === item.answer) {
          resultSpan.innerText = '✔ 正解';
          resultSpan.style.color = 'green';
        } else {
          resultSpan.innerText = `✖ 不正確，答案是 ${item.answer}`;
          resultSpan.style.color = 'red';
        }
      });

      clearBtn.addEventListener('click', () => {
        currentAns = '';
        document.getElementById(`blank-${index}`).innerText = '_____';
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
