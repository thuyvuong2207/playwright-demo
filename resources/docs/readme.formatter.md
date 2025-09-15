This framework uses Biomejs to check/fix the format of code, then use Husky to trigger the formatter
## 1/ Biomejs
- Config rules via file biome.json
### Setting for VSCode
- Go to VSCode Extensions, search and install "Biome"
- Go to VSCode setting, edit file settings.json, add/update property of the file:
```json
{
    
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit",
        "quickfix.biome": "explicit",
        "source.organizeImports.biome": "explicit"
    },
}

```
### Command lines:
- Check format
```bash
biome lint /path/to/code
```

- Fix
```bash
biome lint --write /path/to/code
```

- In case your code didn't pass the formatting, you should fix your code or re-config formatter's rules. (https://biomejs.dev/linter/rules/)

## Husky
- Check file .husky/pre-commit
- Edit command you want to run before each commit




    
    