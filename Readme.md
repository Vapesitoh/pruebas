# YouTube Video Downloader API with Proxy Support

[![YouTube Downloader](https://img.shields.io/badge/YouTube%20Downloader-API-blue)](https://github.com/tuusuario/tu-repositorio)
[![Node.js](https://img.shields.io/badge/Node.js-v16.0.0-green)](https://nodejs.org/)

Una API simple para descargar videos de YouTube con soporte de proxy para mejorar la privacidad y velocidad. Utiliza `ytdl-core` y `express` para realizar las descargas y `https-proxy-agent` para enrutar las solicitudes a través de proxies.

## Características

- Descargar videos de YouTube en varios formatos.
- Soporte para proxy para mejorar la velocidad y privacidad.
- Soporte para descargar solo el audio en formato MP3.
- Interfaz de servidor web con Express y EJS.

## Demo

![Demo](https://media.giphy.com/media/JmFl0dVbYYrQs/giphy.gif)

## Instalación

Sigue estos pasos para instalar y ejecutar el proyecto en tu máquina local.

### Requisitos

- [Node.js](https://nodejs.org/) versión 16 o superior.
- [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/).

### Pasos para ejecutar

1. Clona el repositorio:

    ```bash
    git clone https://github.com/tuusuario/tu-repositorio.git
    ```

2. Accede al directorio del proyecto:

    ```bash
    cd tu-repositorio
    ```

3. Instala las dependencias:

    ```bash
    npm install
    ```

4. Crea un archivo `.config` con los proxies que deseas usar. Un ejemplo de formato es el siguiente:

    ```
    106.42.30.243:82
    157.254.53.50:80
    158.255.77.166:80
    111.26.177.28:9091
    ```

5. Inicia el servidor:

    ```bash
    npm start
    ```

6. El servidor estará corriendo en `http://localhost:3000`.

### Uso

Puedes hacer una solicitud `POST` a las siguientes rutas:

#### `/getVideoInfo`

Obtén la información básica de un video de YouTube (título, miniatura, duración).

**Ejemplo de cuerpo de solicitud:**

```json
{
    "url": "https://www.youtube.com/watch?v=EDQ1dmFEGiI"
}
