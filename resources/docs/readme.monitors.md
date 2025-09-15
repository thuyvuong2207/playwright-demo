* Currently this feature only supports MacOS.
* Also it only works for multi browsers, not multi context due to the limitation of Macos

## Check current monitors


Using command
```bash
npm run check-monitors
```
The return information includes the id and possition (right/left/middle) of your monitors
## Config monitors
Go to file .env
Add variable MONITORS_ORDER with value is the order of monitors you want to setup
```bash
MONITORS_ORDER=1,2,3
```
This feature should be used in case you have multi browser test case
