### Settings
- On VSCode, go to Code > Settings > Config User Snippets
- Choose typescript.json (existing snippet). In case it doesn't exist, create a new snippet, name it typescript.json and start to edit it
- Config a new snippet as above format:
```json
{
  "function check": {
    "prefix": "checkIn",
    "body": ["async checkIn(){", "  super.checkIn();$1", "}\nimport logger from \"src/utils/logger\";"],
    "description": "Base checkIn function"
  },
  "function import base test": {
    "prefix": "ipbasetestp",
    "body": ["import { test } from \"src/fixtures/base-fixtures\";\nimport logger from \"src/utils/logger\";\nimport { Profile, Role } from \"src/types/profile\";\n"],
    "description": "Prepare imports for base test"
  },
  "function start base test": {
    "prefix": "stbasetest",
    "body": ["test(\"$1\", async ({ basePage }) => {\n$2\n})\n"],
    "description": "Start a base test"
  },
  "function import marketing test": {
    "prefix": "ipmktestp",
    "body": ["import { test } from \"src/fixtures/marketing/mk-login-fixture\";\nimport logger from \"src/utils/logger\";\nimport { Profile, Role } from \"src/types/profile\";\n"],
    "description": "Prepare imports for marketing test"
  },
  "function start marketing test": {
    "prefix": "stmktest",
    "body": ["test(\"$1\", async ({ loginPage }) => {\n$2\n})\n"],
    "description": "Start a marketing test"
  }
}
```
- Or you only need to copy content from [here](/configs/snippet.sample.json). SDET will keep update it based on all of members requests.