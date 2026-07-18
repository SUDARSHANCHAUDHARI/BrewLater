# BrewLater Repository Instructions

## Scope

BrewLater is a dependency-free static website. Keep the production runtime limited to semantic HTML, CSS, inline SVG, and vanilla JavaScript. Do not add a framework, backend, external asset, analytics service, or third-party font unless the project owner explicitly requests it.

## Behavior contracts

- Prevent overlapping brew sequences.
- Attempts 1–9 must end with one of the approved excuses.
- Attempt 5 must produce exactly one drop.
- Attempt 10 must fill the cup and display exactly: `Fine. Here is your coffee.`
- Reset must cancel an active sequence before restoring initial state.
- Keep keyboard controls, live status announcements, responsive layout, and reduced-motion support intact.

## Verification

Run the complete local quality gate before committing or publishing:

```sh
pnpm check
```

The site has no build step. Serve the repository root with a local static server for manual review. Do not use browser automation, screenshots, recordings, or traces unless the project owner explicitly authorizes that exact action in the current request.

## Repository safety

- Use `SUDARSHANCHAUDHARI <sunny.sudarshan@gmail.com>` for Git operations.
- Stage files explicitly; do not use `git add .`.
- Never commit `.env*`, credentials, private keys, signing material, host-local state, or generated caches.
- Keep the GitHub repository private until the project owner explicitly approves public visibility.
- Do not add or modify GitHub Actions workflows without explicit approval.
