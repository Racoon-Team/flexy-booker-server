module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        /** @param {{ scope: string }} commit */
        'scope-ticket': (commit) => [
          /^#\d+$/.test(commit.scope),
          'scope must be a GitHub issue number (e.g. #123)',
        ],
      },
    },
  ],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-case': [0],
    'scope-ticket': [2, 'always'],
  },
};
