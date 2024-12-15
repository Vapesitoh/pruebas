const express = require("express");
const bodyParser = require("body-parser");
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios'); // Usamos axios para hacer solicitudes HTTP

const app = express();

// Configurar el motor de vistas EJS
app.set("view engine", "ejs");
process.env.YTDL_NO_UPDATE = 'true'; // Deshabilita la comprobación de actualizaciones

// Función para leer los proxies desde el archivo .config
function loadProxies() {
    try {
        // Leer el archivo .config
        const data = fs.readFileSync('.config', 'utf8');

        // Filtrar solo los proxies válidos que comienzan con "http://" o "https://"
        const proxies = data.split('\n')
            .map(proxy => proxy.trim())
            .filter(proxy => {
                return proxy.length > 0;
            });

        return proxies;
    } catch (error) {
        console.error("Error al leer el archivo .config:", error);
        return [];
    }
}

// Lista de proxies cargados desde el archivo .config
const proxies = loadProxies();

// Middleware para procesar JSON y solicitudes URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Función para verificar si el proxy está funcionando
async function checkProxy(proxy) {
    const agent = new HttpsProxyAgent(proxy); // Crear el agente de proxy
    try {
        const response = await axios.get('https://httpbin.org/ip', {
            httpAgent: agent,
            httpsAgent: agent
        });
        return true;
    } catch (error) {
        console.error(`Error al verificar el proxy ${proxy}:`, error.message);
        return false;
    }
}

// Función para seleccionar un proxy aleatorio y verificar si está funcionando
async function getRandomProxy() {
    if (proxies.length === 0) {
        console.warn("No proxies disponibles.");
        return null;
    }
    const randomIndex = Math.floor(Math.random() * proxies.length);
    let selectedProxy = proxies[randomIndex];

    // Asegurarnos de que el proxy tenga el esquema http:// o https://
    if (!selectedProxy.startsWith("http://") && !selectedProxy.startsWith("https://")) {
        selectedProxy = `http://${selectedProxy}`; // Agregar "http://" si no tiene el prefijo
    }


    // Verificar si el proxy está funcionando
    const isProxyWorking = await checkProxy(selectedProxy);
    if (isProxyWorking) {
        return selectedProxy;
    } else {
        console.warn(`Proxy ${selectedProxy} no está funcionando, seleccionando otro.`);
        return getRandomProxy(); // Si no funciona, seleccionar otro proxy
    }
}

// Ruta principal para renderizar la vista
app.get("/prueba", (req, res) => {
    res.render("index"); // Asegúrate de que index.ejs esté configurado
});

app.post("/getVideoInfo", async (req, res) => {
    const { url } = req.body;

    try {
        // Validar la URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).send("URL inválida.");
        }

        // Seleccionar y verificar un proxy aleatorio
        const proxy = await getRandomProxy();
        const agent = proxy ? new HttpsProxyAgent(proxy) : null;

        // Aquí es donde se realiza el cambio para usar opts.client en lugar de opts.agent
        const info = await ytdl.getBasicInfo(url, {
            requestOptions: agent ? { client: agent } : {}
        });

        // Obtener el título, miniatura y duración
        const title = info.videoDetails.title.replace(/[\/:*?"<>|]/g, ''); // Limpiar caracteres no permitidos
        const thumbnail = info.videoDetails.thumbnails[3].url; // Usar la miniatura de mejor calidad
        const duration = info.videoDetails.lengthSeconds; // Duración en segundos

        // Enviar la información del video al cliente
        res.json({
            title,
            thumbnail,
            duration
        });

    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).send("Error procesando la información del video.");
    }
});

app.post("/download", async (req, res) => {
    const { url, format, title } = req.body; // Recibimos el título

    try {
        // Validar la URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).send("URL inválida.");
        }

        // Limpiar el título para asegurarse de que no tenga caracteres no permitidos
        const cleanedTitle = title.replace(/[\/:*?"<>|]/g, ''); 

        // Definir el nombre del archivo, agregando "BaknApi" al final
        const fileName = `${cleanedTitle} BaknApi.mp3`;

        let options = {};
        if (format === "mp3") {
            // Si es mp3, descargamos solo el audio
            options = { filter: "audioonly" };
        }

        // Seleccionar y verificar un proxy aleatorio
        const proxy = await getRandomProxy();
        const agent = proxy ? new HttpsProxyAgent(proxy) : null; // Crear el agente de proxy

        // Establecer los encabezados para la descarga
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        // Aquí también cambiamos para usar client en lugar de agent
        const videoStream = ytdl(url, {
            ...options,
            requestOptions: agent ? { client: agent } : {}
        });

        // Manejar el error en el flujo de descarga
        videoStream.on('error', (err) => {
            console.error('Error en la descarga:', err);
            if (!res.headersSent) { // Solo enviar error si las cabeceras no han sido enviadas
                res.status(500).send('Error en la descarga del video.');
            }
        });

        // Asegurarse de que el `pipe` se ejecute solo si no hubo un error
        videoStream.pipe(res);
    } catch (error) {
        console.error('Error inesperado:', error);
        if (!res.headersSent) { // Solo enviar error si las cabeceras no han sido enviadas
            res.status(500).send("Error procesando la descarga.");
        }
    }
});

// Iniciar el servidor
app.listen(3000, () => {
});
