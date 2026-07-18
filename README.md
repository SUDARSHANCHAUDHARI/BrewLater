# BrewLater

BrewLater is a standalone interactive coffee machine that would rather do almost anything than make coffee. It runs entirely in the browser with semantic HTML, CSS, inline SVG, and vanilla JavaScript.

## The joke

- Each press of **Make Coffee** starts a fake brewing cycle.
- Attempts 1–9 end with a randomly selected excuse.
- Attempt 5 produces exactly one drop of coffee.
- Attempt 10 fills the cup and concedes: **“Fine. Here is your coffee.”**
- Brewing sequences are guarded so repeated clicks cannot overlap.
- **Reset machine** safely cancels an active cycle and restores the initial state.

The machine includes animated steam, blinking status lights, shaking, fake progress states, an excuse archive, and sounds synthesized in real time with the Web Audio API. There are no audio files or other external assets.

## Run locally

No installation or build step is required. Open `index.html` directly in a modern browser, or serve the repository root with any static file server:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Verify

The production gate uses only Node.js built-ins, so there are no packages to install:

```sh
pnpm check
```

This checks JavaScript syntax and runs the repository tests for local-only assets, unique markup IDs, native button types, accessibility hooks, required attempt behavior, strict content security, and complete progress states.

## Deploy

This repository is ready for any HTTPS static host. Publish the repository root as-is; there is no build command or generated output directory. Keep the source repository private until its owner explicitly approves public visibility.

Before a public launch:

1. Run `pnpm check`.
2. Serve the site locally and manually verify attempts 1, 5, and 10, sound toggling, reset during brewing, keyboard focus, and a narrow mobile viewport.
3. Publish the repository root through the chosen static host.
4. Require HTTPS and configure equivalent HTTP security headers at the host, including a `frame-ancestors` policy. The page already contains a strict CSP fallback for hosts without custom headers.
5. Confirm the deployed page loads only `style.css` and `script.js` from its own origin.

There are no migrations, persistent data, environment variables, external services, or server-side rollback steps. Rolling back means redeploying the previous commit.

## Security and privacy

- BrewLater collects and stores no user data.
- It performs no network requests and loads no third-party runtime resources.
- Sounds are generated locally through the Web Audio API after user interaction.
- A restrictive Content Security Policy blocks network connections, frames, plugins, workers, and inline code.
- Secrets, credentials, private keys, local host state, caches, and build output are excluded by `.gitignore`.

## Accessibility

- All controls are native buttons with visible keyboard focus.
- Progress exposes its current state to assistive technology.
- Completed attempts are announced through a polite live region without narrating every animated progress step.
- The illustration has an accessible title and description.
- Layouts adapt from a two-column countertop to a single-column mobile view.
- `prefers-reduced-motion` disables non-essential motion and shortens the brewing sequence.

## Project files

```text
.
├── test/
│   └── project.test.mjs  # Dependency-free production checks
├── AGENTS.md             # Repository workflow and behavior contracts
├── index.html            # Semantic structure and inline SVG machine
├── style.css             # Responsive layout, illustration styling, and animation
├── script.js             # Attempt state, brewing sequence, reset, and generated audio
├── package.json          # Local verification commands; no dependencies
├── README.md             # Project and release documentation
└── .gitignore            # Secrets, local state, caches, and generated files
```

## Browser support

BrewLater targets current versions of Chrome, Edge, Firefox, and Safari. If Web Audio is unavailable, the machine remains fully usable and simply operates silently.
