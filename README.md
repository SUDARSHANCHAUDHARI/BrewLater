# BrewLater

> Coffee, eventually.

BrewLater is a humorous, interactive coffee machine that keeps avoiding its only job. The entire experience runs in the browser with semantic HTML, CSS, inline SVG, and vanilla JavaScript—without a framework, backend, dependency, or external runtime asset.

- **Version:** 1.0.0
- **Runtime:** Browser-only static website
- **Repository status:** Private until explicitly approved for public release

## Features

- A custom cartoon coffee machine, water tank, empty cup, control panel, and progress display.
- Eight randomized excuses, including “Monday detected” and “Coffee machine needs coffee.”
- Animated steam, blinking lights, machine shaking, progress states, and a motivation gauge.
- Sound effects synthesized locally with the Web Audio API—no audio files are downloaded.
- Attempt tracking with a visible excuse archive.
- Exactly one drop of coffee on attempt 5.
- A full cup on attempt 10 with the final message: **“Fine. Here is your coffee.”**
- Guarded brewing sequences that prevent overlapping runs.
- A reset control that safely cancels active brewing through `AbortController`.
- Responsive layouts, accessible native controls, live status announcements, and reduced-motion support.

## How brewing works

Each press of **Make Coffee** starts a deliberately suspicious four-stage progress sequence:

1. Checking cup compatibility.
2. Preheating excuses.
3. Negotiating with beans.
4. Almost definitely brewing.

Attempts 1–9 finish with a randomly selected excuse. Attempt 5 also delivers one token drop. Attempt 10 finally fills the cup. The button is disabled while a sequence is running, and reset aborts the active sequence before restoring the initial state.

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Illustration | Inline SVG |
| Styling | Responsive CSS, custom properties, transitions, and keyframe animation |
| Interaction | Vanilla JavaScript |
| Sound | Web Audio API oscillators and gain nodes |
| Cancellation | `AbortController` |
| Accessibility | Native buttons, ARIA progress/status metadata, keyboard focus, and `prefers-reduced-motion` |
| Security | Restrictive Content Security Policy with local-only scripts and styles |
| Verification | Node.js syntax checking and the built-in `node:test` runner |

## Getting started

### Prerequisites

The website itself only needs a current browser. For the complete local workflow, use:

- Git for cloning the private repository.
- Python 3 or another static file server for local serving.
- Node.js 18 or newer and pnpm for repository verification.

There are no application dependencies to install.

### Clone

GitHub authentication is required while the repository is private.

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/BrewLater.git
cd BrewLater
```

### Run locally

Open `index.html` directly, or serve the repository root:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Controls

| Control | Behavior |
| --- | --- |
| **Make Coffee** | Starts one guarded brewing attempt |
| **Sound on/off** | Enables or disables generated sound effects |
| **Reset machine** | Cancels active work and resets attempts, cup, progress, and history |

## Verification

Run the complete production gate:

```sh
pnpm check
```

No `pnpm install` step is required. The command validates:

- JavaScript syntax.
- Local-only runtime assets.
- Unique HTML IDs and safe native button types.
- Accessibility hooks and reduced-motion coverage.
- Required fifth- and tenth-attempt behavior.
- Strict Content Security Policy rules with no inline-code escape hatch.
- Balanced CSS and all progress states.

## Accessibility

- All controls are native buttons with visible keyboard focus.
- Brewing progress exposes its value and readable state to assistive technology.
- Completed attempts are announced through a polite live region without narrating every animated percentage.
- The SVG machine includes an accessible title and description.
- The layout adapts from a two-column countertop to a single-column mobile view.
- `prefers-reduced-motion` removes non-essential motion and shortens the brewing sequence.
- The sound control exposes its current state through `aria-pressed` and an updated accessible label.

## Security and privacy

- BrewLater collects, stores, and transmits no user data.
- The application makes no network requests and loads no third-party runtime resources.
- Sounds are generated locally after user interaction.
- A restrictive Content Security Policy blocks network connections, frames, plugins, workers, and inline code.
- The UI uses safe DOM text APIs rather than injecting HTML.
- `.gitignore` excludes secrets, credentials, private keys, local hosting state, caches, and generated output.
- `package.json` is marked `private` to prevent accidental package publication.

## Project structure

```text
.
├── test/
│   └── project.test.mjs  # Dependency-free production checks
├── .gitignore            # Secrets, local state, caches, and generated files
├── AGENTS.md             # Repository workflow and behavior contracts
├── index.html            # Semantic page structure and inline SVG machine
├── package.json          # Project metadata and verification commands
├── README.md             # Project, release, and author documentation
├── script.js             # Brewing state, cancellation, history, and generated audio
└── style.css             # Responsive design, SVG presentation, and animation
```

## Deployment

BrewLater can be served by any HTTPS static host. Publish the repository root as-is; there is no build command, output directory, backend, environment variable, or migration.

Before public launch:

1. Run `pnpm check`.
2. Serve the site locally and manually verify attempts 1, 5, and 10.
3. Verify sound toggling, reset during brewing, keyboard focus, and a narrow mobile layout.
4. Publish the repository root through the chosen static host.
5. Require HTTPS and configure equivalent HTTP security headers, including a `frame-ancestors` policy.
6. Confirm the deployed page only loads `style.css` and `script.js` from its own origin.
7. Change repository visibility only after the owner explicitly approves public release.

Rollback consists of redeploying the previous known-good commit. There is no persistent or server-side data to migrate or restore.

## Browser support

BrewLater targets current versions of Chrome, Edge, Firefox, and Safari. If the Web Audio API is unavailable, the machine remains usable and operates silently.

## Author

- **Name:** Sudarshan Chaudhari
- **Studio:** SudarshanTechLabs
- **Role:** Independent developer
- **Location:** Bangkok, Thailand
- GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
- Email: [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)

## License

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs. All rights reserved.

This private project is currently **UNLICENSED**. No permission is granted to copy, modify, distribute, sublicense, or use the source outside the repository unless the author provides explicit written permission.
