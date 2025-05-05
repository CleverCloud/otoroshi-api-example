import crypto from 'node:crypto';

function randomString(length) {
  return crypto.randomBytes(length)
    .toString('hex')
    .slice(0, length);
}
