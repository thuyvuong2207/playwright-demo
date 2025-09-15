This folder contains fixtures of tests
## 1/ What is fixture
In software testing, a test fixture is a fixed state of the software under test used as a baseline for running tests. Its purpose is to ensure that tests are run in a well-defined and consistent environment, making tests repeatable and reliable.
A test fixture should include 3 parts:
- Setup
- Excute
- Teardown
By default, playwright provides fixtures via test.beforeEach, test.beforeAll, test.afterEach, test.afterAll. But for this framework, we only work with customized fixtures.
## 2/ How to create a customized fixture
(You can follow this instruction: https://playwright.dev/docs/test-fixtures)
- Import test from "@playwright/test" or "src/fixtures/base-fixture"
- Define a new test from base test
```typescript
import { test as base } from "src/fixtures/base-fixtures";
import LoginPage from "src/pom/common/pages/login-page";
export const test = base.extend<{ loginPage: LoginPage }>({
    loginPage: async ({ basePage }, use) => {
        const loginPage = new LoginPage(basePage.getPage());
        await loginPage.selfNavigate();
        await loginPage.login("username", "************");
        await use(loginPage);
    },
});
```
- Export the test and import it in other test files

*Note: The test you create defind will inherit all of setup and teardown from the test you extend from.*

