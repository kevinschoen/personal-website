# Personal website

Static personal site for [Kevin Schoen](https://kevinschoen.dev) — software engineer and technical lead.

**Live site:** [https://kevinschoen.dev](https://kevinschoen.dev)

## Hosting

The site is deployed on [Cloudflare](https://www.cloudflare.com/) and served from this repository. No build step or server runtime is required.

## Project structure

```
├── index.html    # Page content and structure
├── styles.css    # Layout and theme (CSS variables for colors)
├── favicon.svg   # Tab icon (K monogram)
└── README.md
```

## Local development

From the project root, start a simple HTTP server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

You can also open `index.html` directly in a browser, but serving over HTTP better matches production behavior (e.g. loading `styles.css`).

## Stack

- Plain HTML and CSS
- [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- SVG favicon

Changes are made directly in the source files; there is no bundler or package manager.
