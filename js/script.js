// script.js - for test.html
// 功能：處理題庫載入、出題、答題判斷、顯示未答提示、完成視窗、重試與回首頁
// 說明：
//  - 從 URL 讀取 lesson & mode (範例: ?lesson=book1/words/L1.json&mode=word)
//  - 如果 lesson 沒有 book1/ 前綴，會自動補上 'book1/'
//  - 完成全部題目後會呼叫 window.saveTodayAttempt()（若該函式存在於全域）
//  - 需配合 test.html 裡的 #quiz-area, #custom-alert (#alert-msg, #a...-close), #complete-box (#retry, #backHome), #page-title 等 DOM 元素

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* ========== 未作答警告 ========== */
function showAlert(msg) {
  document.getElementById('alert-msg').innerText = msg;
  document.getElementById('custom-alert').classList.remove('hide');
  const ac = document.getElementById('alert-close');
  if (ac) {
    if (!ac.hasAttribute('tabindex')) ac.setAttribute('tabindex', '0');
    ac.focus();
  }
}

/* ========== 儲存今日測驗次數 ========== */
// 獨立出來的函式，處理 localStorage 邏輯
function saveTodayAttempt() {
  const today = new Date().toISOString().slice(0, 10);
  const allData = JSON.parse(localStorage.getItem('dailyStats') || '{}');
  allData[today] = (allData[today] || 0) + 1;
  localStorage.setItem('dailyStats', JSON.stringify(allData));
}

/* ========== 結果完成視窗 ========== */
function showComplete() {
  const box = document.getElementById('complete-box');
  if (box) box.classList.remove('hide');

  // 儲存今天次數（若 main.js 有提供 window.saveTodayAttempt）
  if (typeof window.saveTodayAttempt === 'function') {
    try {
      window.saveTodayAttempt();
    } catch (e) {
      console.warn('saveTodayAttempt error', e);
    }
  }
}

/* ===== 確保 modal 的按鈕可以 click + Enter 關閉（防呆） ===== */
(function () {
  function ensureModalHandlers() {
    const modal = document.getElementById('custom-alert');
    if (!modal) return;
    const closeBtn =
      document.getElementById('alert-close') ||
      modal.querySelector('.alert-box button');
    if (closeBtn && !closeBtn.hasAttribute('tabindex'))
      closeBtn.setAttribute('tabindex', '0');

    if (modal._handlersAttached) return;
    modal._handlersAttached = true;

    if (closeBtn) {
      closeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        modal.classList.add('hide');
      });
    }

    document.addEventListener(
      'keydown',
      (ev) => {
        const isVisible = modal && !modal.classList.contains('hide');
        if (!isVisible) return;
        if (ev.key === 'Escape' || ev.key === 'Esc') {
          modal.classList.add('hide');
        } else if (ev.key === 'Enter') {
          if (closeBtn) closeBtn.click();
          else modal.classList.add('hide');
        }
      },
      true
    );

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const nowVisible = !modal.classList.contains('hide');
          if (nowVisible && closeBtn) {
            setTimeout(() => closeBtn.focus(), 50);
          }
        }
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ['class'] });

    modal.style.pointerEvents = modal.style.pointerEvents || 'auto';
    const inner = modal.querySelector('.alert-box');
    if (inner) inner.style.pointerEvents = inner.style.pointerEvents || 'auto';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureModalHandlers);
  } else {
    ensureModalHandlers();
  }
})();

/* ========== 主程式：在 DOMContentLoaded 後執行 ========== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('script.js loaded (DOM ready)');

  // 1. 音效開關邏輯
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundToggleImg = soundToggleBtn.querySelector('img');
  let isSoundOn = localStorage.getItem('isSoundOn') !== 'false';

  function updateSoundIcon() {
    if (isSoundOn) {
      soundToggleImg.src = 'icons/sound_on.png';
      soundToggleBtn.title = '音效已開啟';
    } else {
      soundToggleImg.src = 'icons/sound_off.png';
      soundToggleBtn.title = '音效已關閉';
    }
  }

  updateSoundIcon();

  soundToggleBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    localStorage.setItem('isSoundOn', isSoundOn);
    updateSoundIcon();
  });

  // 2. 載入音效檔案
  const correctSound = new Audio('../sounds/correct_answer.mp3');
  correctSound.volume = 0.2;

  updateSoundIcon();

  // 讀取 URL 參數
  const params = new URLSearchParams(window.location.search);
  let lessonFile = params.get('lesson') || 'book1/words/L1.json';
  const mode = params.get('mode') || 'sentence';

  // Normalize lessonFile to include book prefix when missing
  if (
    !/^book\d+\//.test(lessonFile) &&
    !lessonFile.startsWith('/') &&
    !lessonFile.includes('://')
  ) {
    lessonFile = 'book1/' + lessonFile;
  }

  console.log('fetching lessonFile ->', lessonFile);

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    let title = '日文練習';
    if (mode === 'word') {
      title = '單字練習 (日翻中)';
    } else if (mode === 'dict') {
      title = '單字練習 (中翻日)';
    } else if (mode === 'sentence') {
      title = '文法練習';
    }
    pageTitle.innerText = title;
  }

  const quizArea = document.getElementById('quiz-area');
  if (!quizArea) {
    console.warn('quiz-area not found in DOM');
    return;
  }

  // 重新測驗與回首頁按鈕
  const retryBtn = document.getElementById('retry');
  if (retryBtn) retryBtn.addEventListener('click', () => location.reload());

  const backHomeBtn = document.getElementById('backHome');
  if (backHomeBtn)
    backHomeBtn.addEventListener('click', () => (location.href = 'index.html'));

  fetch(lessonFile)
    .then((res) => {
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      return res.json();
    })
    .then((quizData) => {
      if (!Array.isArray(quizData)) {
        console.warn(
          'quizData is not an array, trying to find list inside object'
        );
        const arr = Object.values(quizData).find((v) => Array.isArray(v));
        if (!arr) throw new Error('No question array found in JSON');
        quizData = arr;
      }

      const shuffled = quizData.slice().sort(() => Math.random() - 0.5);
      const total = Math.min(6, shuffled.length);
      const selected = shuffled.slice(0, total);
      let correctCount = 0;

      function checkAllCorrect() {
        if (correctCount === selected.length) {
          showComplete();
        }
      }

      selected.forEach((item, index) => {
        const container = document.createElement('div');
        container.className = 'question-block';

        const p = document.createElement('p');
        p.innerHTML = `${index + 1}. ${item.q || item.question || ''}`;
        container.appendChild(p);

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result-text';
        resultSpan.innerText = '';

        // 新增一個旗標，標記這題是否已經答對過
        let isCorrected = false;

        const answers = Array.isArray(item.answer)
          ? item.answer.map((a) => String(a).trim())
          : [String(item.answer).trim()];

        if (mode === 'dict') {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = '請輸入日文平假/片假名';
          input.className = 'inputtext';
          container.appendChild(input);

          const submitBtn = document.createElement('button');
          submitBtn.className = 'icon-btn';
          submitBtn.title = '送出';
          submitBtn.innerHTML = `<img src="icons/check.png" alt="送出" width="20" height="20">`;

          const clearBtn = document.createElement('button');
          clearBtn.className = 'icon-btn';
          clearBtn.id = 'clears';
          clearBtn.title = '清除';
          clearBtn.innerHTML = `<img src="icons/bin.png" alt="清除" width="20" height="20">`;

          const btnGroup = document.createElement('div');
          btnGroup.className = 'btn-group';
          btnGroup.appendChild(submitBtn);
          btnGroup.appendChild(clearBtn);
          btnGroup.appendChild(resultSpan);

          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitBtn.click();
            }
          });

          // 【主要修改部分】: 重新判斷邏輯
          submitBtn.addEventListener('click', () => {
            const val = (input.value || '').trim();
            if (val === '') {
              showAlert('請先輸入答案！');
              return;
            }

            if (answers.includes(val)) {
              if (!isCorrected) {
                // 第一次答對才增加計數
                correctCount++;
                isCorrected = true;
              }
              resultSpan.innerText = '✅';
              resultSpan.style.color = 'green';

              // 新增：如果音效開關是勾選狀態，才播放音效
              if (soundToggle.checked) {
                correctSound.currentTime = 0;
                correctSound.play();
              }
            } else {
              if (isCorrected) {
                // 如果答對過又答錯，計數器減1
                correctCount--;
                isCorrected = false;
              }
              resultSpan.innerText = `❌ 正確答案：${answers.join(' 或 ')}`;
              resultSpan.style.color = 'red';
            }
            checkAllCorrect();
          });

          clearBtn.addEventListener('click', () => {
            input.value = '';
            resultSpan.innerText = '';
            resultSpan.style.color = 'inherit';
          });

          container.appendChild(btnGroup);
        } else {
          // multiple choice style
          const optionsDiv = document.createElement('div');
          optionsDiv.className = 'options';

          let selectedAns = '';

          (item.options || []).forEach((opt) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerText = opt;
            btn.addEventListener('click', () => {
              selectedAns = String(opt);
              const optionBtns = optionsDiv.querySelectorAll('button');
              optionBtns.forEach((b) => b.classList.remove('selected'));
              btn.classList.add('selected');
            });
            optionsDiv.appendChild(btn);
          });

          container.appendChild(optionsDiv);

          const submitBtn = document.createElement('button');
          submitBtn.className = 'icon-btn';
          submitBtn.title = '送出';
          submitBtn.innerHTML = `<img src="icons/check.png" alt="送出" width="20" height="20">`;

          const clearBtn = document.createElement('button');
          clearBtn.className = 'icon-btn';
          clearBtn.id = 'clears';
          clearBtn.title = '清除';
          clearBtn.innerHTML = `<img src="icons/bin.png" alt="清除" width="20" height="20">`;

          const btnGroup = document.createElement('div');
          btnGroup.className = 'btn-group';
          btnGroup.appendChild(submitBtn);
          btnGroup.appendChild(clearBtn);
          btnGroup.appendChild(resultSpan);

          // 【主要修改部分】: 重新判斷邏輯
          submitBtn.addEventListener('click', () => {
            if (selectedAns === '') {
              showAlert('請先選擇答案！');
              return;
            }
            if (answers.includes(String(selectedAns).trim())) {
              if (!isCorrected) {
                // 第一次答對才增加計數
                correctCount++;
                isCorrected = true;
              }
              resultSpan.innerText = '✅';
              resultSpan.style.color = 'green';
              // 新增：如果音效開關是勾選狀態，才播放音效
              if (soundToggle.checked) {
                correctSound.currentTime = 0;
                correctSound.play();
              }
            } else {
              if (isCorrected) {
                // 如果答對過又答錯，計數器減1
                correctCount--;
                isCorrected = false;
              }
              resultSpan.innerText = `❌ 正確答案：${answers.join(' 或 ')}`;
              resultSpan.style.color = 'red';
            }
            checkAllCorrect();
          });

          clearBtn.addEventListener('click', () => {
            selectedAns = '';
            const optionBtns = optionsDiv.querySelectorAll('button');
            optionBtns.forEach((btn) => btn.classList.remove('selected'));
            resultSpan.innerText = '';
            resultSpan.style.color = 'inherit';
          });

          container.appendChild(btnGroup);
        }

        quizArea.appendChild(container);
      });
    })
    .catch((err) => {
      console.error('載入題目失敗', err);
      showAlert('載入題目失敗，請檢查網址或稍後再試。');
      // 新增這段程式碼，讓 alert 視窗的按鈕點擊後回首頁
      const closeBtn = document.getElementById('alert-close');
      if (closeBtn) {
        closeBtn.onclick = () => {
          location.href = 'index.html';
        };
      }
    });
});
