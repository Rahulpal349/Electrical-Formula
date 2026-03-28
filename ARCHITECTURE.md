# Electrical Formula Hub Architecture

This document is intended for AI coding assistants and developers to understand the project structure and how to add new features.

## Philosophy
The project is built on a modular, **subject-based** structure. Every subject (e.g., Circuit Theory, Power Plant) encapsulates its own pages, specific CSS, and specific JavaScript. Shared components (like the navigation bar, calculator modal, and animations) are kept in the `shared/` directory.

## Directory Structure
```
root/
├── index.html            # The main landing page
├── _redirects            # Cloudflare Pages redirect rules (for legacy URLs)
├── build.js              # Node.js script to bundle the app into `dist/`
├── update-paths.js       # Utility script to mass-update relative HTML links
│
├── shared/               # Files used across multiple or all subjects
│   ├── css/
│   │   └── style.css     # Global design system, variables, components
│   └── js/
│       ├── app.js        # Navbar, search, theme logic
│       ├── formulas.js   # Master formula data object
│       ├── calculator.js # Modal calculator logic
│       ├── animations.js # GSAP timeline animations
│       └── hero-bg.js    # Three.js background for index
│
├── images/               # Shared global images
│
└── subjects/             # Subject modules
    ├── circuit/          
    │   ├── index.html    # The main page for Circuit Theory
    │   ├── css/          # CSS specific to Circuit Theory
    │   └── js/           # JS specific to Circuit Theory
    ├── machines/
    ├── measurements/
    ├── power-systems/
    ├── power-plant/      
    │   ├── index.html
    │   ├── diagram.html  # Animated flow diagram (standalone iframe/page)
    │   ├── css/
    │   └── js/
    ├── control/          # Sometimes subjects don't need specific css/js
    ├── electronics/
    ├── signals/
    ├── microprocessor/
    ├── estimation/
    └── utilization/
```

## How to Work on This Codebase

### 1. Adding a New Subject (Module)
1. **Create Directory**: Create a new folder under `subjects/new-subject/`.
2. **Create HTML**: Add `index.html`. Base it off an existing subject's HTML so it retains the `<nav>` and footer.
   *Ensure relative paths pointing to `shared/` are correct: e.g. `../../shared/css/style.css`.*
3. **Register Link**: Update the `<nav>` links in **every** other `index.html` file (including root) to point to your new module. You can use the `update-paths.js` script to automate mass-updates if needed.
4. **Update Build**: No changes to `build.js` are necessary as long as the new module is within `subjects/`.

### 2. Modifying the Global Style
Most design tokens (colors, fonts, flex-box utils) live in `shared/css/style.css`.
*   Avoid adding module-specific classes to `style.css`. Focus on reusable utility classes.
*   If you need module-specific styling (e.g., `#power-plant-grid`), put it in `subjects/power-plant/css/powerplant.css`.

### 3. Deploying
This uses Cloudflare Pages.
1. Run `npm run build` (which runs `node build.js`).
2. The `dist/` folder is generated containing all production-ready files.
3. Push to `main` to trigger the Cloudflare Pages CI/CD via `wrangler.jsonc` or GitHub actions.

## Technology Stack
- **HTML5 & Vanilla CSS**: No UI framework or preprocessors used.
- **Vanilla JavaScript**: ES6+ modules.
- **KaTeX**: Used for rendering LaTeX formulas dynamically.
- **GSAP**: Used for advanced physics and timeline animations.
- **D3.js / Three.js**: Used for specific visual diagrams.
