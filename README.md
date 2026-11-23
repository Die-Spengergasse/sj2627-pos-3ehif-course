# POS 3EHIF · Learning Site

Self-study site for POS in 3EHIF (school year 2026/27): units based on the slide decks, knowledge checks,
a practice mode and small IntelliJ exercises. Static SvelteKit site, deployed to GitHub Pages.

## Local development

Requirements:

- Node.js 22
- Java (JDK 27) and **PlantUML** for diagrams, which are rendered to SVG at build time.
  Either install the `plantuml` command (e.g. `brew install plantuml`, which brings Graphviz along),
  or set `PLANTUML_JAR` to a downloaded `plantuml.jar` and install Graphviz yourself.

```bash
npm install
npm run dev      # dev server
npm run check    # svelte-check
npm test         # unit tests (the PlantUML tests need plantuml / PLANTUML_JAR)
npm run build    # static site in build/
```

Rendered diagrams are cached in `node_modules/.cache/plantuml`, so only changed diagrams start a JVM.
