module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testMatch: [
    "**/Test/**/*.test.js",
    "**/tests/**/*.test.js"
  ],
  verbose: true,
  testTimeout: 10000
};