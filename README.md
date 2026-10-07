# Proyecto Base: Pruebas de Reconocimiento con un Monkey (Cypress)

Un _monkey_ ejecuta eventos aleatorios sobre una aplicación (clics, teclas, desplazamientos,
navegación, cambios de tamaño de pantalla) para descubrir fallos que las pruebas guiadas por casos
no encuentran, inspirado en el [Android Monkey](https://developer.android.com/studio/test/other-testing-tools/monkey).
Este módulo implementa sobre [Cypress](https://docs.cypress.io) un monkey aleatorio y uno
"inteligente" que elige elementos interactivos y datos plausibles. Está basado en
[TheSoftwareDesignLab/monkey-cypress](https://github.com/TheSoftwareDesignLab/monkey-cypress).

## Requisitos

- Node.js 24 (`lts/krypton`). El módulo incluye un `.nvmrc`, por lo que pueden usar `nvm use`.
- npm (incluido con Node.js).
- `prepare` descarga el binario de Cypress. En Linux se necesitan las
  [dependencias del sistema](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).

## Instalación

Desde la **raíz del repositorio** del proyecto:

```bash
npm run monkey:install
npm run monkey:prepare
```

> [!IMPORTANT]
> Instalen siempre desde la raíz. `monkey:install` deja las dependencias del módulo en su propia
> carpeta `node_modules`, aisladas de los demás módulos. Un `npm install` dentro de la carpeta del
> módulo instala en la raíz del repositorio y modifica el `package-lock.json` raíz sin ese aislamiento.

## Ejecución

| Acción | Desde la raíz | Desde `reconocimiento/misw-4103-monkey` |
|---|---|---|
| Ejecutar el monkey (headless, con reporte y video) | `npm run monkey:test` | `npm test` |
| Ejecutar con la interfaz de Cypress | `npm run monkey:ui` | `npm run test:ui` |
| Borrar reportes, capturas y videos anteriores | — | `npm run clean:reports` |

Para cambiar parámetros sin editar la configuración, ejecuten desde la carpeta del módulo, por
ejemplo `npx cypress run --expose seed=12345` o
`npx cypress run --config baseUrl=http://localhost:2368`.

## Estructura

```plaintext
misw-4103-monkey/
├── .nvmrc
├── package.json
├── cypress.config.js                 # aplicación a explorar y parámetros del monkey
└── cypress/
    ├── e2e/monkey.cy.js              # ejecuta el presupuesto de acciones en orden aleatorio
    └── support/
        ├── e2e.js
        ├── stay-on-origin.js         # evita que el monkey salga de la aplicación
        └── commands/                 # acciones: mouse, teclado, página y utilidades del reporte
```

## Configuración

En `cypress.config.js`:

- **`e2e.baseUrl`**: aplicación a explorar. Por defecto `https://example.cypress.io` (un sitio de
  ejemplo de Cypress) para que el monkey funcione sin preparar nada. Para explorar Ghost usen
  `http://localhost:2368` (o la URL de su instancia).
- **`expose.seed`**: semilla de los números aleatorios. Con la misma semilla y la misma aplicación,
  el monkey repite la misma secuencia de eventos, lo que permite reproducir un fallo.
- **`expose.delay`**: espera en milisegundos entre acciones.
- **`expose.actions`**: cuántas veces se ejecuta cada tipo de evento (0 lo desactiva):

| Evento | Qué hace |
|---|---|
| `click` | Clic, doble clic, clic derecho o _hover_ sobre una posición aleatoria |
| `scroll` | Desplazamiento hacia arriba, abajo, izquierda o derecha |
| `keypress` | Enter, Tab, un carácter o una tecla especial (con o sin modificadores) |
| `viewport` | Cambia el tamaño y la orientación de la pantalla (dispositivos predefinidos) |
| `navigation` | Recargar, avanzar o retroceder en el historial |
| `smartClick` | Clic (u otra acción del mouse) sobre un elemento interactivo visible: `a`, `button`, `input`, `select`, `textarea` |
| `smartCleanup` | Borra el `localStorage`, las cookies o un campo de texto |
| `smartInput` | Escribe datos plausibles según el tipo del `input` (correo, fecha, teléfono, URL, número, texto, contraseña) |

`stay-on-origin.js` cancela los clics en enlaces y los envíos de formularios que llevarían a otro
sitio: desde Cypress 15, navegar a otro origen sin `cy.origin()` hace fallar la ejecución.

## Reportes

Con `cypress run` se genera un reporte de [Mochawesome](https://github.com/adamgruber/mochawesome) en
`cypress/results/monkey-report.html` (y `.json`) con la secuencia de eventos ejecutados, más el
video en `cypress/results/videos/` y las capturas de los fallos en `cypress/results/screenshots/`.
La carpeta `cypress/results/` está en el `.gitignore`.

Si la ejecución falla (por ejemplo, una excepción no controlada de la aplicación), la prueba aparece
como fallida y el reporte muestra los eventos que se alcanzaron a ejecutar: es un hallazgo para
analizar. Reprodúzcanlo con la misma semilla.

## Solución de problemas

- **`Cypress could not verify that this server is running`**: la `baseUrl` no responde; revisen
  que la aplicación (por ejemplo, Ghost) esté levantada.
- **`Cannot find module '…/Resources/app/index.js'`**: la variable de entorno `ELECTRON_RUN_AS_NODE`
  está definida (pasa con procesos lanzados desde extensiones de VS Code, por ejemplo asistentes de
  IA). Ejecuten desde una terminal normal o eliminen la variable (`unset ELECTRON_RUN_AS_NODE`).
- **Aviso de Electron obsoleto**: Cypress 16 marca como obsoleto su navegador Electron. Si tienen
  Chrome, Edge o Firefox, pueden usarlos con `npx cypress run --browser chrome`.
- **Advertencia `EBADENGINE`**: están usando una versión de Node.js anterior a la 24.

## Referencias

- [monkey-cypress (TheSoftwareDesignLab)](https://github.com/TheSoftwareDesignLab/monkey-cypress)
- [Documentación de Cypress](https://docs.cypress.io/app/get-started/why-cypress)
- [`Cypress.expose()`](https://docs.cypress.io/api/cypress-api/expose)
