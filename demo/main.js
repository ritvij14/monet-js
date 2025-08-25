document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const btn = document.getElementById("parse");

  function doParse() {
    const text = input.value.trim();
    if (!text) {
      output.textContent = "(parsed JSON will appear here)";
      return;
    }
    if (!window.monetJs || !window.monetJs.parseMoney) {
      output.textContent = "monetJs library not loaded";
      return;
    }
    try {
      const result = window.monetJs.parseMoney(text) || null;
      output.textContent = JSON.stringify(result, null, 2);
    } catch (err) {
      output.textContent = `Error: ${err.message}`;
    }
  }

  // debounce helper
  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(doParse, 300);
  });

  btn.addEventListener("click", doParse);
});
