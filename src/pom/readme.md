This POM folder contains 2 main part: page object module and the ui component.

- Page object module is used to stored class of each page, including its elements, values and actions. 
Example:
```typescript
import BasePage from "src/base/base-page";
import type { Page } from "playwright/test";
import LOGIN_UI from "src/pom/common/ui/login-ui";
import HOME_UI from "src/pom/common/ui/home-ui";
import type { Locator } from "@playwright/test";
import { test } from "src/fixtures/base-fixtures";
export default class LoginPage extends BasePage {
    private txtEmail: Locator;
    private txtPassword: Locator;
    private btnLogin: Locator;
    constructor(page: Page, testInfo?: any) {
        super(page, testInfo);
        this.txtEmail = this.locator(LOGIN_UI.txtEmail);
        this.txtPassword = this.locator(LOGIN_UI.txtPassword);
        this.btnLogin = this.locator(LOGIN_UI.btnLogin);
        this._url = `${this.BS_URL}/login`;
    }

    async login(email: string, password: string) {
        await test.step("Login", async () => {
            await this.fill(this.txtEmail, email);
            await this.fill(this.txtPassword, password);
            await this.click(this.btnLogin);
            await this.waitForSelector(HOME_UI.lblHome);
        });
    }
    async selfNavigate() {
        await super.selfNavigate({
            locator: this.btnLogin,
        });
    }
}
```

Most of pages inherit from BasePage (from "src/base/base-page")

- UI components contains all of selectors (xpath or css, xpath preferred) which will be used by page object module. Example:
```typescript
export const LOGIN_UI = {
    txtEmail: "input[name='email']",
    txtPassword: "input[type='password']",
    btnLogin: "button[type='submit']",
};
export default LOGIN_UI;
```

- Common rules:
    + Pages and UI Components should be store seperately
    + Try to init all of page element fields as Locator in constructor, which can be easier to reuse.
    + Each action function should do a specific feature. Should pass arguments so we can reuse that function for multi different test steps.
    + Use decorator or directly test.step for each action
    + Naming convention for elements:
    + ![Alt text](/resources/images/docs-images/elementnaming.PNG)
