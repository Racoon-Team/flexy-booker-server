/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/testSetup.ts"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  clearMocks: true,
};
