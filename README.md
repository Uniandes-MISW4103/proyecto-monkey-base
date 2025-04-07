# Cypress Random Tester (Monkey)

Este repositorio contiene el código para un monkey aleatorio desarrollado utilizando [Cypress](https://www.cypress.io/), un ejecutor de pruebas End to End construido sobre JavaScript. Usamos esta tecnología debido a la facilidad para gestionar páginas web en una variedad de navegadores, incluyendo Chrome, Canary, Edge, Electron, etc., y su funcionalidad de grabar y reproducir. La idea del primer monkey es realizar una prueba completamente aleatoria en una aplicación web, inspirado en un monkey similar, el [Android Monkey](https://developer.android.com/studio/test/monkey). El segundo monkey existe debido a la alta tasa de errores y la baja probabilidad de obtener eventos que cambien el estado de la aplicación del monkey Monkey.

Este repositorio está basado en la implementación de [TheSoftwareDesignLab/monkey-cypress](https://github.com/TheSoftwareDesignLab/monkey-cypress).

## Requisitos

- Node.js (v20 o superior). Recomendamos usar lts/iron.
- npm o yarn para la gestión de dependencias.

## Cómo ejecutar
Para usar el monkey, debes seguir estos pasos:

- **Instalar los módulos requeridos**

    ```bash
    # using npm
    npm install
    # using yarn
    yarn install
    ```

- **Configurar los parámetros deseados**: La carpeta raíz del repositorio contiene los archivos de configuración de Cypress (`cypress.config.js`), los cuales incluyen los parámetros de configuración para el monkey aleatorio.

    ```javascript

    const { defineConfig } = require("cypress");

    module.exports = defineConfig({
        // ...
        e2e: {
            // ...
            baseUrl: "https://www.google.com/",
        },
        env: {
            seed: 0xf1ae533d,   // Test seed intended to allow for consistent values in tests
            delay: 1000,        // Delay between action executions
            
            actions: {
                click: 0,       // Hovers and clicks (single, double, right) on a random position
                scroll: 0,      // srolls (horizontal and verticall)
                keypress: 0,    // alphanumeric and special keys
                viewport: 0,    // Change in viewports and orientation
                navigation: 0,  // reload, go back, go forward

                smartClick: 0,      // Hovers and clicks (single, double, right) on clickable elements
                smartCleanup: 0,    // Clears inputs, cookies and local storage
                smartInput: 0,      // Fills input tags with fake data (multi-character)
            },
        },
        // ...
    });

    ```

- **Ejecutar el monkey**: Los comandos para ejecutar las pruebas deben ejecutarse desde la carpeta raíz.

    ```bash
    npm run test:ui
    # Ejecución en modo headless
    npm run test
    ```
    Nota: El navegador predeterminado es Electron 78 en modo headless. Para probar con otro navegador, agrega la opción `--browser <nombre-o-ruta-del-navegador>` al comando de ejecución, indicando cuál de los [navegadores soportados](https://docs.cypress.io/guides/guides/launching-browsers.html#Browsers) deseas usar.


## Configuración

Después de evaluar una serie de posibles eventos, definimos las siguientes 5 categorías básicas en las que los eventos podrían agruparse:

- **Eventos de Clic Aleatorio**: Clic izquierdo, derecho o doble clic, así como desplazamientos (_mouseover_) realizados a un elemento desde una posición aleatoria.
- **Eventos de Desplazamiento**: Desplazar la página hacia arriba, abajo, a la izquierda o a la derecha.
- **Eventos de Teclado**: Introducir un carácter (alfanumérico) o un carácter especial (`Enter`, `Supr`, `Esc`, `Backspace`, `Flechas`) con modificadores (`Shift`, `Alt` o `Ctrl`) dentro de un elemento enfocado. Es equivalente a presionar una tecla del teclado al enfocar un elemento.
- **Eventos de Navegación de Página**: Navegación típica que un usuario podría realizar, como ir a la página anterior o a la siguiente en la pila de navegación.
- **Eventos del Navegador**: Eventos que cambian la configuración del navegador, como cambiar el tamaño de la ventana.

Adicionalmente, hay 3 categorías _más inteligentes_ que pueden incluirse en las ejecuciones:

- **Eventos de Clic Aleatorio Inteligente**: Clic izquierdo, derecho o doble clic, así como desplazamientos (_mouseover_) realizados a un elemento _clickeable_ (`<a>`, `<button>`, `<input>`).
- **Eventos de Limpieza Inteligente**: Eventos que limpian la configuración del navegador (cookies, almacenamiento local) o limpian un campo `<input>`.
- **Entrada Inteligente**: Introduce diferentes tipos de valores (frases, correos electrónicos, contraseñas, fechas, números) en un campo `<input>` dependiendo de su tipo.

## Reportes

El monkey está configurado para usar [Mochawesome](https://www.npmjs.com/package/cypress-mochawesome-reporter) como herramienta de reporte. Por defecto, el reporte contendrá la secuencia de eventos intentados que se ejecutaron y un video de la ejecución.

> [!NOTE]
> - El reporte solo se genera para ejecuciones en modo headless.
> - Para ejecuciones largas, el video puede deshabilitarse en la configuración de Cypress (`video: false`), o la compresión puede modificarse para reducir el tamaño del archivo (`videoCompression`).
