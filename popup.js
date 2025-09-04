/* global LanguageModel */

document.addEventListener("DOMContentLoaded", async () => {
  const queryInput = document.getElementById("queryInput");
  const responseOutput = document.getElementById("responseOutput");
  const statusEl = document.getElementById("status");
  queryInput.focus();
  let session = null;

  async function showInitialStatus() {
    const availability = await LanguageModel.availability();
    if (availability === "unavailable") {
      statusEl.textContent = "Model unavailable. Please check your Chrome version and system requirements.";
      return null;
    } else if (availability === "downloadable") {
      statusEl.textContent = "Model needs to be downloaded.";
    } else if (availability === "available") {
      statusEl.textContent = "Model is ready to use.";
    }
    return availability;
  }

  async function ensureSession() {
    if (session) return session;

    const availability = await LanguageModel.availability();
    if (availability === "unavailable") {
      statusEl.textContent = "Model unavailable. Please check your Chrome version and system requirements.";
      return null;
    }

    session = await LanguageModel.create({
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          const pct = Math.round(e.loaded * 100);
          statusEl.textContent = `Downloading model... ${pct}%`;
        });
      },
    });

    if (availability === "downloadable") {
      statusEl.textContent = "Downloading model... 0%";
    } else {
      statusEl.textContent = "Model is ready.";
    }

    return session;
  }

  async function runPromptStream(promptText) {
    const s = await ensureSession();
    if (!s) return;

    try {
      statusEl.textContent = "⏳ Generating response...";
      responseOutput.value = "";

      // 加一句指令，限制只回一句話
      const finalPrompt = `${promptText}\n\nAnswer in one short sentence.`;

      const stream = s.promptStreaming(finalPrompt);
      for await (const chunk of stream) {
        responseOutput.value += chunk;
        responseOutput.scrollTop = responseOutput.scrollHeight;
      }

      statusEl.textContent = "Done.";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error occurred. Check console.";
    }
  }

  // 🔹 debounce 工具，避免太頻繁呼叫
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // 每次輸入改變 → 自動串流生成（延遲 300ms）
  queryInput.addEventListener(
    "input",
    debounce(async () => {
      const text = queryInput.value.trim();
      if (text) {
        await runPromptStream(text);
      } else {
        responseOutput.value = "";
        statusEl.textContent = "📝 Waiting for input...";
      }
    }, 300)
  );

  // 初始化顯示模型狀態
  await showInitialStatus();
});
