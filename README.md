# Yusuf Gadelrab Portfolio

Personal portfolio site for `Yusuf-Gadelrab.github.io`. It is a React app published with GitHub Pages and contains Yusuf's projects, writing, profile content, and an in-browser edit/export workflow for updating the site data.

## Stack

- React 18
- Create React App / `react-scripts`
- GitHub Pages deployment via `gh-pages`
- Bun lockfile is present, but the package scripts also work with npm

## Local Setup

```bash
npm install
npm start
```

The dev server opens at:

```text
http://localhost:3000
```

## Common Commands

```bash
npm start      # run locally
npm run build  # production build
npm run deploy # publish build/ to GitHub Pages
```

## Environment

No `.env` file is required for the current static portfolio. Keep any future analytics tokens, API keys, or private content out of git.

## Tests

There is no dedicated test suite yet. Use the production build as the basic check before deployment:

```bash
npm run build
```

## Editing Content

Most portfolio content lives in the `siteData` object inside `src/App.js`.

Two update paths are supported:

- Edit `siteData` directly in code and redeploy.
- Use the site's edit/export UI locally, then paste the exported data back into `src/App.js` before deploying.

## Project Structure

```text
public/index.html  # app shell
src/index.js       # React entry point
src/App.js         # portfolio UI and siteData content
build/             # generated production build
```

## Deployment

The `homepage` field in `package.json` points at:

```text
https://Yusuf-Gadelrab.github.io
```

Deploy with:

```bash
npm run deploy
```

## Notes

- Do not commit secrets or private tokens.
- Treat `build/` as generated output.
- Run a production build before deploying after large content or UI changes.

## License / Status

Personal portfolio site. No open-source license is currently declared.
