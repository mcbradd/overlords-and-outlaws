import { appendFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

export function nextBuildNumber(previous, sha) {
  if (!sha) throw new Error('A source revision is required for a published build.');
  if (previous?.buildNumber !== undefined && (!Number.isSafeInteger(previous.buildNumber) || previous.buildNumber < 1))
    throw new Error('Published build metadata has an invalid number; refusing to reset it.');
  if (!previous?.buildNumber) return 1;
  return previous.sha === sha ? previous.buildNumber : previous.buildNumber + 1;
}

async function main() {
  if (process.argv.includes('--prepare-prod')) {
    // Resolve the publishing branch through Git, then read its immutable commit.
    // A cached branch-name CDN response could otherwise reuse a build number.
    const remote = execFileSync('git', ['ls-remote', 'https://github.com/mcbradd/overlords-and-outlaws-prod.git', 'refs/heads/gh-pages'], {
      encoding: 'utf8', timeout: 30000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    }).trim();
    const publishedSha = remote.split(/\s+/)[0];
    if (remote && !/^[0-9a-f]{40}$/.test(publishedSha)) throw new Error('Invalid publishing branch revision.');
    const response = publishedSha ? await fetch(`https://raw.githubusercontent.com/mcbradd/overlords-and-outlaws-prod/${publishedSha}/revision.json`, {
      cache: 'no-store', signal: AbortSignal.timeout(30000),
    }) : null;
    if (response && !response.ok && response.status !== 404)
      throw new Error(`Cannot read last published build (${response.status}); refusing to reset numbering.`);
    const previous = response?.ok ? await response.json() : null;
    const number = nextBuildNumber(previous, process.env.GITHUB_SHA);
    if (!process.env.GITHUB_ENV) throw new Error('GITHUB_ENV is required.');
    appendFileSync(process.env.GITHUB_ENV, `VITE_BUILD_NUMBER=${number}\nVITE_BUILD_SHA=${process.env.GITHUB_SHA}\nVITE_BUILD_PUBLISHED=true\n`);
    console.log(`Prepared evaluation Build ${number}.`);
  } else if (process.argv.includes('--write-prod')) {
    const buildNumber = Number(process.env.VITE_BUILD_NUMBER);
    if (!Number.isSafeInteger(buildNumber) || buildNumber < 1 || !process.env.GITHUB_SHA)
      throw new Error('Missing prepared build identity.');
    writeFileSync('dist/revision.json', JSON.stringify({
      branch: 'prod', sha: process.env.GITHUB_SHA, buildNumber, builtAt: new Date().toISOString(),
    }, null, 2) + '\n');
    writeFileSync('dist/.nojekyll', '');
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
