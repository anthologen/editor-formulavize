<p align="center">
  <img src="assets/formulavize_logo.svg" alt="Formulavize logo" width="120" />
</p>

<h1 align="center">formulavize</h1>

<p align="center">
  Stylizeable workflow diagrams from <strong>fiz</strong>.
  <br />
  <a href="https://docs.formulavize.com">Documentation</a>
</p>

<p align="center">
  <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen friendly" /></a>
</p>

Formulavize is a split-pane editor for **fiz**, a small domain-specific language
for describing directed acyclic graphs. You write a fiz recipe on the left; it is
parsed, compiled into a DAG, and drawn on the right as you type.

```
*node{ text-valign: "center"; text-halign: "center" }
%multiply{ background-color: #33acff; label: "×" }

v_squared = multiply(v(), v())
v_cubed = multiply(v_squared, v())
output(v_cubed)
```

Every call is a node, every argument is an edge, and everything else — styles,
namespaces, imports, renderer choice — is about how that graph is organized and
drawn.

## Features

- **Live editor** — CodeMirror 6 with fiz syntax highlighting, autocomplete,
  inline diagnostics, and color swatches in style blocks.
- **A language for DAGs** — calls, variables, namespaces, and imports, so a
  graph can be composed out of reusable pieces instead of hand-placed boxes.
- **CSS-like styling** — reusable style tags, per-call style blocks, and
  name-based bindings that style every call sharing a name.
- **Pluggable renderers** — the app ships a Cytoscape.js renderer (dagre, ELK,
  breadthfirst, and manual layouts) plus a minimal text renderer; a recipe picks
  one with `^<name>{ }`.
- **Headless CLI** — render a `.fiz` file to PNG, JPG, SVG, or TXT without a
  browser.
- **Interactive tutorial** — the language taught one puzzle at a time, in the
  app.

## Getting Started

Requirements: **Node.js >= 26**, **pnpm >= 12** (this package is pnpm-only).

```sh
pnpm install
pnpm dev        # Vite dev server
```

Then open the URL Vite prints. The app starts with an example recipe loaded; the
graduation-cap button in the toolbar opens the tutorial.

## Command Line

`pnpm cli` renders a recipe headlessly, using the same compiler and the renderer
the recipe itself selects:

```sh
pnpm cli recipe.fiz                                # -> recipe.png
pnpm cli recipe.fiz -o out/graph.svg --theme dark   # svg, dark theme
pnpm cli recipe.fiz --format jpg --scale 2          # double-scale jpg
pnpm cli --help
```

Relative imports in a recipe resolve against that recipe's own directory. See
the [CLI reference](https://docs.formulavize.com/app/cli) for every flag.

## The fiz Language

| Construct            | Syntax                   | Example                       |
| -------------------- | ------------------------ | ----------------------------- |
| Call                 | `name(args)`             | `f(x, y)`                     |
| Assignment           | `lhs = rhs`              | `y = f(x)`                    |
| Namespace            | `name[ stmts ]`          | `prep[ y = f(x) ]`            |
| Qualified name       | `name.name`              | `prep.y`                      |
| Import               | `name @ "path.fiz"`      | `lib @ "./lib.fiz"`           |
| Style tag            | `#name{ styles }`        | `#finish{ border-width: 4 }`  |
| Style on a call      | `name(args){ styles }`   | `f(x){ #finish }`             |
| Style binding        | `%keyword{ styles }`     | `%rest{ color: #0a0 }`        |
| Global style binding | `*keyword{ styles }`     | `*node{ color: #eee }`        |
| Renderer directive   | `^name{ keys }`          | `^cytoscape{ layout: "elk" }` |
| About note           | `~name{ keys }`          | `~author{ name: "Ada" }`      |
| Comments             | `// line`, `/* block */` | `// a comment`                |

The [language guide](https://docs.formulavize.com/guide/calls-and-variables)
walks through these in order; the
[syntax reference](https://docs.formulavize.com/reference/language-syntax) is
the complete list.

## Architecture

```
fiz source (CodeMirror editor)
  → [lang-fiz / lezer-fiz]     → Lezer syntax tree
  → [compiler/astFactory.ts]   → RecipeTreeNode (normalized AST)
  → [compiler/dagFactory.ts]   → Dag
  → [renderers/cyDag]          → interactive graph
```

| Path                | What lives there                                                |
| ------------------- | --------------------------------------------------------------- |
| `src/compiler/`     | Parser driver, AST, DAG, imports, diagnostics. Renderer-neutral |
| `src/components/`   | Vue components: editor, graph view, toolbar, popups             |
| `src/rendererApi/`  | The renderer contract and registry. Knows nothing of Cytoscape  |
| `src/renderers/`    | `cyDag` (Cytoscape), `minExample` (worked reference renderer)   |
| `src/autocomplete/` | Completions built from the current DAG and the active renderer  |
| `src/editor/`       | CodeMirror extensions that are not completions                  |
| `src/cli/`          | The `fviz` CLI entry point and its Node file fetcher            |
| `src/tutorial/`     | Tutorial lesson plan and puzzlets                               |
| `tests/`            | Vitest unit and integration tests                               |

The fiz grammar itself lives in two sibling packages, consumed from npm:
[`@formulavize/lezer-fiz`](https://www.npmjs.com/package/@formulavize/lezer-fiz)
(the Lezer grammar) and
[`@formulavize/lang-fiz`](https://www.npmjs.com/package/@formulavize/lang-fiz)
(the CodeMirror language integration).

**Adding a renderer:** write a `RendererPlugin` against `src/rendererApi/` and
add it to `src/renderers/defaultRenderers.ts` — that is the only existing file
that changes. `src/renderers/minExample/` is the reference implementation.

## Scripts

| Command              | Does                                  |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Vite dev server                       |
| `pnpm build`         | Type-check with `vue-tsc`, then build |
| `pnpm serve`         | Preview a production build            |
| `pnpm cli`           | Run the headless renderer CLI         |
| `pnpm test`          | Vitest unit and integration tests     |
| `pnpm test:watch`    | Vitest in watch mode                  |
| `pnpm test:coverage` | Coverage report                       |
| `pnpm test:lint`     | ESLint                                |
| `pnpm test:format`   | Prettier check                        |
| `pnpm format`        | Prettier write                        |

Run a single test file with `pnpm vitest run tests/unit/path/to/file.test.ts`.

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org),
  enforced by commitlint; `pnpm cz` (commitizen) will prompt you through one.
- Husky and lint-staged run ESLint and Prettier on staged files before a commit.
- PR titles are linted, and CI runs build, tests, lint, and format on every PR.
- Releases are cut by release-please from the commit history.

## License

[MIT](LICENSE)
