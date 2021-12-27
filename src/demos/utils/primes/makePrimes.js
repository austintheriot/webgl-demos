const fs = require('fs/promises');

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

const makePrimes = async (count, cb) => {
  let i = 0;
  let found = 0;
  while (found < count) {
    if (isPrime(i)) {
      found++;
      await cb(i);
    }
    i++;
  }
}

const writePrimesToFile = async (path, count) => {
  await fs.writeFile(path, 'export const primes = [');
  await makePrimes(count, async (prime) => {
    await fs.appendFile(path, `${prime},`);
  });
  await fs.appendFile(path, '];');
}

writePrimesToFile('src/demos/prime_spiral/primes.js', 1_000_000);