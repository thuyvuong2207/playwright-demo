# Core Architecture Components

## Base Classes Structure

1. BaseComponent (`src/base/base-component.ts`)
Core component with 200+ lines of UI interaction methods:

- **Functionality**: Contains all fundamental UI interaction methods (click, fill, wait, asserts, etc.)
- **Role Management**: Provides role and profile management
- **Media Support**: Implements screenshot and video recording capabilities
- **Dialog Handling**: Handles dialog interactions and API request interception

2. BasePage (`src/base/base-page.ts`)

- **Page-level functionality extending BaseComponent**:
- **Navigation**: Manages navigation and URL handling
- **Environment Support**: Implements environment-specific URL configuration
- **API Integration**: Provides API collection and request tracking
- **State Management**: Handles page state management and cookies


## Page Object Model (POM) Structure

src/pom/
├── pages/                     # Page classes implementing business logic
│   ├── common/                # Shared pages (login, home, breadstack-base)
│   ├── wp/                    # WP module pages
├── ui/                        # UI element definitions (selectors)
│   ├── common/                # Shared UI elements
│   ├── wp/                    # WP UI elements
...

## Test Organization
src/test/
├── tests                      # Test script 
│   ├── global                 # Global test script
│   │   ├── global-setup.ts    # Global setup before test
│   │   └── global-teardown.ts # Global tear down after test
│   └── ui                     # UI Test script
│       └── wp                 # WP module test script
...