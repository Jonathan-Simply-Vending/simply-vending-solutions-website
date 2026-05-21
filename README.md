# Simply Vending Solutions — Website

Marketing site for Simply Vending Solutions LLC. Premium beverage amenities — draft cold brew, lattes, AI micro markets, and resident events — for apartment buildings and offices in Washington, DC and Northern Virginia.

## Stack

- Single-page React app (React 18 + ReactDOM, loaded via CDN)
- In-browser Babel for JSX
- Hash-based routing
- Static assets served from `assets/`

No build step required — `index.html` is the entry point and runs directly in the browser.

## Local development

Serve the project root with any static file server, for example:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

Deployed as a static site on Vercel. No build command required.
