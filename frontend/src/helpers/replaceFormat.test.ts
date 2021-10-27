import assert from 'assert';

import replaceFormat from './replaceFormat';

describe(replaceFormat, () => {
  it('replaces the extension with another', () => {
    assert.strictEqual(replaceFormat('foo/bar/quux.preview.jpeg', 'avif'), 'foo/bar/quux.preview.avif');
  });
});
