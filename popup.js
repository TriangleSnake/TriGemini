// 自動執行的匿名async函數
(async () => {
    const session = await window.ai.createTextSession();
    var result = "";

    document.getElementById('queryInput').addEventListener('input', async function () {
        const query = this.value;

        // 檢查是否有輸入，如果輸入框是空的，不發送請求
        if (!query) {
            document.getElementById('responseOutput').value = '';
            return;
        }

        try {
            // Gemini API 呼叫的示例
            result = await session.prompt(query);
            document.getElementById('responseOutput').value = result;
        } catch (error) {
            document.getElementById('responseOutput').value = 'Generating response...';
        }
    });
})();