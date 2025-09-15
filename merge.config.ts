export default {
  testDir: 'tests',
  reporter: [['html', { open: 'never' },],
  ['json', { outputFile: 'playwright-report/results.json' }],],
};