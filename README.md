# Open Muezzin

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#) [![Plasmo](https://img.shields.io/badge/Plasmo-F4A261?logo=plasmo&logoColor=fff)](#)

Open-Muezzin is an open-source platform and extension that provides accurate prayer times and location-based Athan notifications, with no tracking, no ads, and universal support for most browsers.

## Getting Started

1. **Install dependencies:**

    ```bash
    pnpm install
    ```

2. **Start the development server:**

    ```bash
    pnpm dev
    ```

3. **Load the extension in your browser:**
    - Open your browser's extension management page.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `build/chrome-mv3-dev` directory (or the appropriate one for your browser).

## Build for Production

To create a production-ready build, run:

```bash
pnpm build
```

This will create a production bundle in the `build` directory, which you can then package and publish.
