import type { Config } from '@jest/types';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const swcrcPath = resolve(__dirname, './.cjs.swcrc');
const swcrc = JSON.parse(readFileSync(swcrcPath, 'utf-8'));

// Common Jest configuration shared across packages
const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    // This does not do type-checking and assumes that's happening elsewhere for TS test files (e.g. as part of the
    // build process)
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest', swcrc],
  },
};

export default config;
