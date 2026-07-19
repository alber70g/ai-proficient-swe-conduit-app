// Node 25+ removed `SlowBuffer`, which jsonwebtoken's transitive dependency
// `buffer-equal-constant-time` still references at load time. Restore a
// minimal alias so the API and the test suite run on current Node versions.
// Safe on older Node: the assignment only happens when SlowBuffer is gone.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bufferModule = require('buffer');

if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}

export {};
