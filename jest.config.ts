export default {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageProvider: "v8",
  rootDir: "dist",
  roots: [
    "<rootDir>"
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "jest-environment-node",
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  transform: {},
};
