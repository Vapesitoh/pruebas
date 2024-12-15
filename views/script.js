document.getElementById('downloadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('url').value;
    const format = document.getElementById('format').value;
    const status = document.getElementById('status');

    status.textContent = "Procesando la descarga...";

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, format })
        });

        if (!response.ok) throw new Error("Error en el servidor");

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `video.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        a.click();

        status.textContent = "Descarga completada.";
    } catch (error) {
        status.textContent = "Ocurrió un error: " + error.message;
    }
});
