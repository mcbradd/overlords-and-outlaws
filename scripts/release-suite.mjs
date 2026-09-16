import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, createWriteStream, writeFileSync } from "node:fs";
import { createServer, preview } from "vite";

// Keep every executable verification/probe here, including retained probes that
// might reveal stale assumptions. A failure blocks release; it is never waived.
const script = (file, ...args) => [
  "--import",
  "tsx",
  `scripts/${file}`,
  ...args,
];
const checks = [
  ["build", ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["bundle", ["node_modules/vite/bin/vite.js", "build"]],
  ["unit", ["--import", "tsx", "--test", "tests/*.test.ts"]],
  ["ui", ["node_modules/vitest/vitest.mjs", "run"]],
  ["simulation", script("simulate.ts")],
  ["decision-audit", script("decision-audit.ts", "200", "release")],
  ["balance-soak", script("balance-v3.ts")],
  ["browser", script("ux-interactions.ts")],
  ["layout", script("ux-layout.ts")],
  ["card-faces", script("ux-cardfaces.mjs")],
  ["physical", script("physical-verify.ts")],
  ["tutorial-regression", script("tutorial-regression.ts")],
  ["damage-regression", script("damage-token-regression.ts")],
  ["tutorial-drag", script("tutorial-drag.ts")],
  ["session02", script("session02-browser.ts")],
  ["interaction-v3", script("interaction-v3.ts")],
  ["playthrough-lesson", script("playthrough.ts")],
  ["playthrough", script("playthrough.ts", "normal")],
  ["playthrough-motion", script("playthrough.ts", "normal", "--motion")],
  ["family", script("family-browser.ts")],
  [
    "family-compact",
    script("family-browser.ts", "--compact", "--four", "--estate"),
  ],
  ["physical-motion", script("physical-motion.ts")],
  ["portraits", script("portrait-audit.ts", "--complete")],
  ["gallery", script("texture-gallery-smoke.mjs")],
  ["showcase", script("showcase-preview.ts")],
  ["opening", script("physical-preview.ts")],
  ["dense-courts", script("full-table.ts")],
  ["components", script("component-preview.ts")],
  ["opponents", script("opponent-preview.ts")],
  ["frames", script("frame-v3-preview.mjs")],
  ["layout-probe", script("layout-repro.mjs")],
  ["retained-visual-probe", script("visual-v2.mjs")],
  ["pages-smoke", script("pages-smoke.mjs")],
];

if (process.argv.includes("--list")) {
  console.log(checks.map(([name]) => name).join("\n"));
  process.exit(0);
}
const base = process.env.PAGES_BASE_PATH || "/overlords-and-outlaws-prod/";
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const output = `artifacts/release/${runId}`;
mkdirSync(output, { recursive: true });
for (const dir of ["v2", "v3", "physical"])
  mkdirSync(`artifacts/${dir}`, { recursive: true });
const report = {
  sha: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  dirty: !!execFileSync("git", ["status", "--porcelain"], {
    encoding: "utf8",
  }).trim(),
  base,
  startedAt: new Date().toISOString(),
  checks: [],
  visualInspection:
    "pending: inspect opening, action, dense courts and compact screenshots",
};
const save = () => {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  writeFileSync(
    "artifacts/release/latest.json",
    JSON.stringify(report, null, 2),
  );
};
const servers = [];
let previewServer;
async function run(name, args) {
  const started = Date.now();
  const log = createWriteStream(`${output}/${name}.log`);
  console.log(`Starting ${name}`);
  const result = await new Promise((resolve) => {
    let timedOut = false;
    const child = spawn(process.execPath, args, {
      env: {
        ...process.env,
        PAGES_BASE_PATH: base,
        VITE_SAVE_NAMESPACE: name === "bundle" ? "prod:" : "",
        SAVE_NAMESPACE: name === "pages-smoke" ? "prod:" : "",
        BASE_URL:
          name === "pages-smoke"
            ? `http://localhost:4176${base}`
            : "http://localhost:5176",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    child.stdout.pipe(log, { end: false });
    child.stderr.pipe(log, { end: false });
    const timer = setTimeout(
      () => {
        timedOut = true;
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
            windowsHide: true,
          });
        } else child.kill("SIGKILL");
      },
      (name === "decision-audit"
        ? 60
        : name.startsWith("playthrough")
          ? 10
          : 5) * 60_000,
    );
    child.once("error", (error) => {
      clearTimeout(timer);
      resolve({ passed: false, error: error.message });
    });
    child.once("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ passed: code === 0 && !timedOut, code, signal, timedOut });
    });
  });
  log.end();
  report.checks.push({
    name,
    ...result,
    seconds: (Date.now() - started) / 1000,
  });
  save();
  console.log(
    `${result.passed ? "PASS" : "FAIL"} ${name}; log: ${output}/${name}.log`,
  );
}
try {
  // Existing probes use these four ports. Strict ports prevent testing another
  // checkout by accident; they must be available before starting this command.
  for (const port of [5173, 5174, 5175, 5176]) {
    const server = await createServer({
      base: "/",
      server: { host: "localhost", port, strictPort: true },
    });
    servers.push(server);
    await server.listen();
  }
  for (const [name, args] of checks) {
    if (name === "pages-smoke") {
      if (
        report.checks.some(
          (c) => ["build", "bundle"].includes(c.name) && !c.passed,
        )
      ) {
        report.checks.push({
          name,
          passed: false,
          error: "No verified build to probe",
        });
        continue;
      }
      previewServer = await preview({
        base,
        preview: { host: "localhost", port: 4176, strictPort: true },
      });
    }
    await run(name, args);
  }
} catch (error) {
  report.infrastructureError = String(error);
} finally {
  await Promise.all(servers.map((server) => server.close()));
  if (previewServer)
    await new Promise((resolve) => previewServer.httpServer.close(resolve));
  report.completedAt = new Date().toISOString();
  report.passed =
    !report.infrastructureError &&
    report.checks.length === checks.length &&
    report.checks.every((c) => c.passed);
  save();
  console.log(
    `Release suite ${report.passed ? "passed" : "FAILED"}: ${output}/report.json`,
  );
  process.exitCode = report.passed ? 0 : 1;
}
