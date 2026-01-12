## Project Overview

This project is a web-based meme generator called "memash". It is built with React and TypeScript, using Vite for the development server and build process. The UI is styled with Tailwind CSS, and it appears to use components from `shadcn/ui`.

The core functionality allows users to:
- Upload an image or fill the canvas with a random color.
- Add text overlays to the image.
- Move the text overlays by dragging them.
- Download the resulting image as a meme.
- Undo and redo actions.
- The application state is persisted in the browser's `localStorage`.

The application is structured with a main `App` component that renders a `Header` and a `Main` page. The `Main` page contains the core logic for the meme generator, including the canvas, text handling, and user interactions. A custom hook, `useCanvas`, encapsulates the canvas-related logic.

## Building and Running

### Prerequisites
- Node.js and `pnpm` are required. The `package.json` specifies `pnpm@9.0.0`.

### Development
To run the development server:
```bash
pnpm install
pnpm dev
```

### Build
To create a production build:
```bash
pnpm build
```

### Linting and Formatting
The project uses BiomeJS for linting and formatting.

- To lint the code:
  ```bash
  pnpm lint
  ```
- To check for errors:
  ```bash
  pnpm check
  ```
- To format the code:
    ```bash
    pnpm format
    ```
- To format and fix the code:
    ```bash
    pnpm format:fix
    ```

### Type Checking
To check for TypeScript errors:
```bash
pnpm typecheck
```

## Development Conventions

### Coding Style
- The project uses TypeScript with a strict configuration (`"strict": true` in `tsconfig.json`).
- It follows the standard React functional component-based architecture.
- Path aliases are configured in `vite.config.ts` and `tsconfig.json` for easier imports (e.g., `@components` and `@shared`).
- The project uses CSS Modules for component-specific styles, as seen in the `styles.module.css` files.
- The UI is built using Tailwind CSS and `shadcn/ui` components.

### State Management
- The main component (`src/pages/main/index.tsx`) uses React's `useState` and `useEffect` hooks for state management.
- There is a simple history and redo stack implemented for the undo/redo functionality.

### File Structure
- `src/app`: Contains the main `App` component.
- `src/components`: Contains reusable UI components.
- `src/lib`: Contains utility functions.
- `src/pages`: Contains the main pages of the application.
- `src/shared`: Contains shared hooks, constants, and other utilities.
- `src/widgets`: Contains more complex UI components that are composed of smaller components.
