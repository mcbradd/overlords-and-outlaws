import test from 'node:test';
import assert from 'node:assert/strict';

test('published builds begin at one, increment for new sources, and retain identity on retries', async () => {
  // JS is also invoked directly by CI, so exercise that exact allocator.
  const { nextBuildNumber } = await import('../scripts/build-identity.mjs');
  assert.equal(nextBuildNumber(null, 'first'), 1);
  assert.equal(nextBuildNumber({ sha: 'old-unversioned' }, 'first'), 1);
  assert.equal(nextBuildNumber({ sha: 'first', buildNumber: 1 }, 'first'), 1);
  assert.equal(nextBuildNumber({ sha: 'first', buildNumber: 1 }, 'second'), 2);
  assert.throws(() => nextBuildNumber({ sha: 'first', buildNumber: -1 }, 'second'));
});
