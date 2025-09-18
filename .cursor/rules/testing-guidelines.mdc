# Playwright Framework – Testing Guidelines and Best Practices

## Test Organization and Structure
### 1. Test File Naming Convention
Pattern: {module}.{feature}.{testType}.spec.ts
Examples:
    - dl.addressBook.crud.spec.ts (delivery address book CRUD)
    - settings.users.spec.ts (settings user management)
    - wp.agegate.spec.ts (agegate on wp)


### 2. Test Categories and Tags
``` typescript
// Authentication tests
test.describe("Authentication", () => {
  test("Should login with valid credentials", async ({ basePage }) => {
    // Test implementation
  });
});

// Role-based tests with tags
test("Admin user should access all features @admin", async ({ basePage }) => {
  // Test implementation
});

// Store-specific tests
test("Should handle Shopify store integration @shopify-store", async ({ basePage }) => {
  // Test implementation
});


### 3. Test Data Management
// Use fixtures for test data
test("Should show user dashboard", async ({ basePage, mkAccData, autoTemplateData }) => {
  const userData = mkAccData.getUserData({ tag: "admin" });
  const orderData = autoTemplateData.queryFirstMatchedData("s.orders[0]");
  // Test implementation using data
});