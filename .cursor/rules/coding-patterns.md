# Playwright Framework - Coding Patterns and Best Practices

## 1. Page Object Model (POM) Implementation

### 1. Page Class Structure
```typescript
- Standard page class template
export default class ExamplePage extends BreadstackBasePage {
  private element1: Locator;
  private element2: Locator;

  constructor(page: Page | BasePage, options?: IRoleProfile) {
    super(page, options);
    this._url = `${this.BS_URL}/example`;
    this.element1 = this.locator(EXAMPLE_UI.element1);
    this.element2 = this.locator(EXAMPLE_UI.element2);
  }

  @step()
  async checkIn() {
    await this.assertVisible(this.element1);
    await this.assertVisible(this.element2);
    await super.checkIn(); // Call parent checkIn if extending BreadstackBasePage
  }
}

### 2. Reusable widget template
export default class ExampleWidget extends Widget {
  private button: Locator;
  private input: Locator;

  constructor(page: Page | BaseComponent, options: IWidget) {
    super(page, options);
    this.button = this.locator(WIDGET_UI.button);
    this.input = this.locator(WIDGET_UI.input);
  }

  @step()
  async performAction(value: string) {
    await this.fill(this.input, value);
    await this.click(this.button);
  }
}
