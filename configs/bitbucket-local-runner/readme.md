Note: This version of local-runner only support mac machine. If you want to run it on Win/Linux machine, it would require some adjustment to adapt other OS
## Feature
- Currently, our daily tests are running on local runner of bitbucket. It requires us to start local server by commands.
## Instruction
- After start local machine, go to the project dir terminal
- Run command to setup one of local-runner. E.g: For runner "local1":
```bash
npm run setup-local-runner1
```
Note: we only run setup command once each time we setup a repo on a local machine.
- Run command to start local-runner. E.g: For runner "local1":
```bash
npm run start-local-runner1
```
Note: it would requires us to run this command after each time local machine start/restart

- Check runners status on repo