# Design Canvas agent CLI

The CLI uses local catalog data and Node.js only. No model, network, MCP server or installation is required. Run from the repository root:

```sh
node tools/design-cli.mjs search 'minimalism' --json
node tools/design-cli.mjs style ADT-01 --json
node tools/design-cli.mjs kit validate ./my-kit.json
node tools/design-cli.mjs kit export ./my-kit.json --out ./my-export
node --test tests/test-design-cli.mjs
```

Search is deterministic, case-insensitive lexical substring matching of every query word against serialized style records, sorted by exact style ID; it is not semantic search. Style IDs are case-sensitive and exact. `--json` supplies the full records for search and style. Errors go to stderr and return a nonzero exit status.

## Kit format

```json
{
  "schemaVersion": 1,
  "name": "My project",
  "headline": "A clear interface",
  "styleId": "ADT-01",
  "paletteId": "Radix amber",
  "fonts": {"heading": "Albert Sans", "body": "Albert Sans"},
  "accent": "#2457D6",
  "assets": [
    {"type": "icons", "id": "lucide:arrow-right"},
    {"type": "gradients", "id": "Gradient 1"}
  ],
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

`paletteId` is an exact palette name, and both fonts must be exact family names from `data/fonts.json`. Accent is six-digit hexadecimal; timestamp is UTC ISO 8601. Asset types are the plural catalog collection keys in `data/assets.json`: `icons`, `patterns`, `gradients`, `shadows`, `radii`, `easings`, `animations`, `sizes`, `fontStacks`, and `palettes`; `components` additionally accepts the web kit's exact `button` and `input` IDs. IDs are `lib:name` for icons, and `key`, `id` or `name` for other records (or the string itself). Animations can validate, but **cannot currently export**: the catalog contains only animation names, not keyframes. Export fails before writing anything instead of inventing keyframes.

## Export and licensing

Export requires a new destination directory whose parent already exists. Existing destinations are never overwritten; `..` path components are rejected. A web ZIP's `project.json` can be passed directly to `kit validate` or `kit export`. The CLI exports identical project data as `project.json` and `kit.json`, plus `brief.md`, `tokens.css`, selected icon bytes under `assets/icons/`, component HTML under `assets/`, `provenance.json`, a copy of the source ledger and `SOURCES.md`. Include `tokens.css` when using component snippets. Web-compatible `--kit-accent`, `--kit-accent-contrast`, `--kit-font-heading`, `--kit-font-body`, `--kit-style-*` and numbered `--kit-palette-*` tokens are included alongside legacy CLI tokens. Contrast chooses black or white using the web kit's luminance calculation. Selected pattern and token values are in CSS; their catalog records appear in provenance. Asset variables use the 1-based asset selection index. Open Props gradient/shadow dependencies are resolved with the same fallback values as the application. Font files are not bundled. Provenance includes catalog license references, not a claim that every listed license applies to every selection. Inspect original licenses before redistribution; some palette sources may have no license entry in the catalog.
