import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const readProjectFile = (fileName) => readFileSync(join(projectRoot, fileName), "utf8");

const html = readProjectFile("index.html");
const css = readProjectFile("style.css");
const script = readProjectFile("script.js");

const requiredExcuses = [
  "Still waking up",
  "Monday detected",
  "Finding motivation",
  "Coffee machine needs coffee",
  "Updating beans",
  "Cup not emotionally ready",
  "Brewing meeting in progress",
  "Please try after breakfast",
];

test("the production runtime uses only local assets", () => {
  assert.doesNotMatch(html, /\b(?:href|src)=["']https?:\/\//i);
  assert.match(html, /<link rel="stylesheet" href="style\.css">/);
  assert.match(html, /<script src="script\.js" defer><\/script>/);
});

test("HTML IDs are unique and controls use safe native button types", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Duplicate HTML IDs found");

  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  assert.equal(buttons.length, 3);
  assert.ok(buttons.every((button) => button.includes('type="button"')));
});

test("the page keeps its accessibility contracts", () => {
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /<title id="machineTitle">/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("the brew behavior keeps its required outcomes", () => {
  for (const excuse of requiredExcuses) {
    assert.ok(script.includes(`"${excuse}"`), `Missing excuse: ${excuse}`);
  }

  assert.match(script, /const TOTAL_ATTEMPTS = 10;/);
  assert.match(script, /const DROP_ATTEMPT = 5;/);
  assert.match(script, /if \(state\.brewing \|\| state\.attempts >= TOTAL_ATTEMPTS\)/);
  assert.match(script, /activeController\.abort\(\)/);
  assert.ok(script.includes('elements.statusMessage.textContent = "Fine. Here is your coffee.";'));
});

test("the strict content policy has no inline-code escape hatch", () => {
  const policy = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/s)?.[1];

  assert.ok(policy, "Content Security Policy meta tag is missing");
  assert.match(policy, /default-src 'self'/);
  assert.match(policy, /script-src 'self'/);
  assert.match(policy, /style-src 'self'/);
  assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(html, /\son[a-z]+=/i);
  assert.doesNotMatch(html, /\sstyle=/i);
  assert.doesNotMatch(script, /\.innerHTML\s*=/);
  assert.doesNotMatch(script, /\.style\./);
});

test("CSS structure and progress states are complete", () => {
  const openingBraces = css.match(/\{/g)?.length ?? 0;
  const closingBraces = css.match(/\}/g)?.length ?? 0;

  assert.equal(openingBraces, closingBraces, "CSS braces are unbalanced");

  for (const progress of [12, 31, 58, 87, 92, 100]) {
    assert.ok(css.includes(`[data-progress="${progress}"]`), `Missing progress state ${progress}`);
  }
});
