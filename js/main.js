// main.js - for index.html
// 功能：處理書籍切換、按鈕綁定到 test.html (加入 lesson & mode)、顯示今日次數等

document.addEventListener('DOMContentLoaded', () => {
  console.log('main.js loaded');

  const bookSelector = document.getElementById('book-selector');
  const quizGroups = document.querySelectorAll('.select-group');
  const todayCountEl = document.getElementById('today-count');

  // 顯示今天已完成測驗次數（若 localStorage 沒資料則顯示 0）
  function showTodayCount() {
    const today = new Date().toISOString().slice(0, 10);
    const allData = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const count = allData[today] || 0;
    const countBox = document.getElementById('today-count');
    if (countBox) {
      countBox.innerHTML = `今天已完成測驗 <span class="count-circle">${count}</span> 次`;
    }
  }

  // 儲存今日測驗次數（被 test.html 的完成邏輯呼叫時也能共用）
  function saveTodayAttempt() {
    const today = new Date().toISOString().slice(0, 10);
    const allData = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    allData[today] = (allData[today] || 0) + 1;
    localStorage.setItem('dailyStats', JSON.stringify(allData));
    showTodayCount();
  }

  // Expose saveTodayAttempt 到全域，方便 test.html/其他 script 呼叫
  window.saveTodayAttempt = saveTodayAttempt;

  // 當按下「前往測驗」時要做的：組成 test.html?lesson=bookX/xxx&mode=...
  quizGroups.forEach((group) => {
    const btn = group.querySelector('.button_go');
    const select = group.querySelector('select');

    if (!btn || !select) return;

    btn.addEventListener('click', (e) => {
      if (e && e.preventDefault) e.preventDefault();

      const opt = select.options[select.selectedIndex];
      const lessonRaw = opt ? opt.dataset.lesson : null;
      if (!lessonRaw) {
        alert('請先選擇課程');
        return;
      }

      // 取得目前選的書籍（若無就預設 book1）
      const selectedBook =
        bookSelector && bookSelector.value ? bookSelector.value : 'book1';

      // 組成完整 lesson path（避免重複前綴）
      let lessonPath = lessonRaw;
      if (
        !lessonPath.startsWith('book1/') &&
        !lessonPath.startsWith('book2/') &&
        !lessonPath.startsWith('/')
      ) {
        lessonPath = `${selectedBook}/${lessonRaw}`;
      }

      // 由 select 的 id 決定 mode（例: lesson-word -> word）
      let mode = 'word';
      if (select.id && select.id.includes('dict')) mode = 'dict';
      if (select.id && select.id.includes('sentence')) mode = 'sentence';

      const href = `test.html?lesson=${encodeURIComponent(
        lessonPath
      )}&mode=${encodeURIComponent(mode)}`;
      // 導向 test.html（含參數）
      location.href = href;
    });
  });

  // 若書籍切換時想要動態變更 option 顯示（例如顯示哪本書被選）
  if (bookSelector) {
    bookSelector.addEventListener('change', (e) => {
      // 目前僅把 bookSelector value 用於點按時的前綴
      console.log('book changed to', e.target.value);
    });
  }

  // 初始化
  showTodayCount();
});
