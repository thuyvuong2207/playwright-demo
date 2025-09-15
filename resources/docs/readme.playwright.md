(You can follow this detail instruction: https://playwright.dev/docs/test-configuration#basic-configuration)

- By default, playwright import config from file playwright.config.ts
- If you want to use an alternative, you can use test command like
```bash
npx playwright test --config=my-custom-config.js
```

Playwright config has some basic component:
## 1/ Basic
- testDir: default path of tests files when we run "npx playwright test"
- fullyParallel(boolean): run tests in parallel mode or not
- retries (number): number of test retries (if test case failed)
- workers (number): number of parallel process at the same time
## 2/ Use
Property of projects:
- trace: record via traceview (https://playwright.dev/docs/next/trace-viewer-intro)
- video: record via video (https://playwright.dev/docs/next/videos#record-video)
- ...
## 3/Reporter
Format and output of reporters (https://playwright.dev/docs/test-reporters)
## 4/Projects
*Test project is a collection of testsuits*

- This part of config defines path, name, device and flag for each test projects. Example:
```typescript
{
    name: "demo",
    use: { ...devices["Desktop Chrome"] },
    testMatch: /tests\/demo/,
    grep: /@(good)/,
}
```
Explain:
- name: name of project
- use: including device, baseUrl,...
- testMatch: choose only test files that match the regex or string
- grep: only run test has matched tag
