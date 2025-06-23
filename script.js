const quizArea = document.getElementById('quiz-area');

fetch('quizData.json')
  .then((response) => response.json())
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
      submitBtn.innerText = '提交';

      const clearBtn = document.createElement('button');
      clearBtn.innerText = '清除';

      const resultSpan = document.createElement('span');
      resultSpan.className = 'result-text';

      submitBtn.addEventListener('click', () => {
        if (currentAns === item.answer) {
          resultSpan.innerText = '✅';
          resultSpan.style.color = 'green';
        } else {
          resultSpan.innerText = `❌ 答案是 ${item.answer}`;
          resultSpan.style.color = 'red';
        }
      });

      clearBtn.addEventListener('click', () => {
        currentAns = '';
        document.getElementById(`blank-${index}`).innerText = '_____';
        resultSpan.innerText = '';

        // 把所有選項按鈕的選中樣式移除
        const optionBtns = optionsDiv.querySelectorAll('button');
        optionBtns.forEach((btn) => btn.classList.remove('selected'));
      });

      btnGroup.appendChild(submitBtn);
      btnGroup.appendChild(clearBtn);
      btnGroup.appendChild(resultSpan);

      container.appendChild(btnGroup);

      quizArea.appendChild(container);
    });
  })
  .catch((err) => console.error('載入題目失敗', err));
