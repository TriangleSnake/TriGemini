document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('queryInput').focus();
});
(async () => {
    const session = await window.ai.createTextSession();
    var result = "";

    document.getElementById('queryInput').addEventListener('input', async function () {
        const query = this.value;

        if (!query) {
            document.getElementById('responseOutput').value = '';
            return;
        }

        try {
            result = await session.prompt(query);
            document.getElementById('responseOutput').value = result;
        } catch (error) {
            document.getElementById('responseOutput').value = 'Generating response...';
        }
    });
})();