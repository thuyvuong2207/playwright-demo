### Steps:
- Prepare the page class
- Run UI generator:
```bash
npx ts-node src/utils/ui-generator.ts path-to-page-file.ts
```
It will automatic generate UI component file based on page file. If the UI file is already existed, it will create new file with number index.
 
Some optional:
- "-r" or "-replace": replace the already existed file
- "-u" or "-update": update the already existed file with new UI component, keep the old components value