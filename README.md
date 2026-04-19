# Craft Node 🚀

**Craft Node** es una potente herramienta de línea de comandos (CLI) diseñada para automatizar la creación y configuración inicial de proyectos Node.js. Olvídate de configurar manualmente carpetas, archivos base y dependencias; con Craft Node, puedes tener una estructura profesional lista en segundos.

## ✨ Características

-   **Interactividad Intuitiva:** Guía paso a paso a través de preguntas sencillas.
-   **Soporte Multi-lenguaje:** Elige entre **JavaScript** o **TypeScript** según tus preferencias.
-   **Integración con Express:** Opción de incluir el framework **Express** de forma automática.
-   **Arquitecturas Flexibles:**
    -   **Simple:** Un único punto de entrada ideal para scripts rápidos o microservicios mínimos.
    -   **Modular:** Una estructura robusta y escalable que separa controladores, servicios, modelos y rutas (basada en el patrón de diseño por módulos).
-   **Configuración Automática:** Genera archivos `package.json` y `tsconfig.json` preconfigurados.
-   **Instalación Rápida:** Posibilidad de instalar dependencias y arrancar el proyecto inmediatamente tras la creación.

## 🛠️ Requisitos

-   **Node.js** (Versión 18 o superior recomendada)
-   **npm** (Viene incluido con Node.js)

## 🚀 Instalación y Uso

### Clonar el repositorio y preparar la CLI

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/tu-usuario/craft-node.git
    cd craft-node
    ```

2.  Instala las dependencias del generador:
    ```bash
    npm install
    ```

3.  Compila el proyecto:
    ```bash
    npm run build
    ```

### Ejecutar Craft Node

Para iniciar el asistente de creación, simplemente ejecuta:

```bash
npm start
```

O si prefieres usarlo de forma global (tras realizar un `npm link`):

```bash
craft-node
```

## 📂 Estructura de Plantillas

El proyecto utiliza un sistema de plantillas flexible ubicado en `src/templates`:

-   **express/**: Plantillas base para aplicaciones que utilizan el framework Express.
-   **nodejs/**: Plantillas para aplicaciones Node.js puras (sin frameworks web).
-   **modular/**: Estructura de carpetas avanzada que incluye módulos de ejemplo (ej. productos) con lógica separada por capas (Controller, Service, Repository, etc.).

## 📝 Scripts Disponibles

-   `npm start`: Ejecuta el generador directamente usando `ts-node`.
-   `npm run build`: Compila el código fuente de TypeScript a JavaScript en la carpeta `dist/`.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
