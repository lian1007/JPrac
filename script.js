// 綁定兩個前往測驗按鈕
document.querySelectorAll('.go').forEach((btn) => {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;

    if (parent.id === 'wordsclass') {
      const url = parent.querySelector('#lesson-word').value;
      location.href = url;
    } else if (parent.id === 'sentenceclass') {
      const url = parent.querySelector('#lesson-sentence').value;
      location.href = url;
    }
  });
});
