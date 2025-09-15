This Document only for MacOS (Macbook, Mac Mini)
## Install Xcode
- Go to appstore
- I will require an Apple ID, if you didn't have any account, signup by these steps:
    + Go to MacOs Settings Systems, search and choose "Apple ID"
    + Signup with your company email
    + For billing, you can choose method: None, city: New York, zip:12207, area: 212, phone: <random 7 digits number>
- Find and install Xcode
- In the middle of install progress, it will ask you to choose develop environment, please choose MacOs and iPhone, so Xcode will install the appropriate simulator version
## Run demo project with Xcode
- Click create new project, fill project name 
- On the top of Xcode window, there is a tab to select device that code will run on. Choose the installed simulator you want.
- Click to run project
### Errors and how to fix it
- "Logging Error: Failed to initialize logging system. Log messages may be missing. If this issue persists, try setting IDEPreferLogStreaming=YES in the active scheme actions environment variables."
    - Go to Products > Edit Schemes > Run > Argument > Environment Variables
    - Create an env var with key:IDEPreferLogStreaming, value=Yes
- "Missing package products"
    + File > Packages > Reset Package Caches
## Install Xcode cli
- Install
```bash
xcode-select --install
```
- List all existed devices
```bash
xcrun simctl list devices
```
#### Errors and how to fix it
- "xcrun: error: unable to find utility "simctl", not a developer tool or in PATH"
    + Run:
    ```sudo xcode-select -s /Applications/Xcode.app```
    + If still get the error, run:
    ```sudo xcode-select -s /Applications/Xcode.app``` and type "agree" to accept

