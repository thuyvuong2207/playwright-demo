# 1/ Install

## 1.1/ Local

-   Install nodejs: https://nodejs.org
-   Install project:
    -   Clone from bitbucket
    -   Access to Project
-   Install packages:

```bash
npm i
npx playwright install chromium --with-deps
```

## 1.2/ Using docker

-   Build image

```bash 
docker build -t playwright-ui .
```

-   Create container

```bash
docker run -t -d --name playwright-ui-cont playwright-ui
```
## 3/ Project configuration
- How to config playwright project: [here](/resources/docs/readme.playwright.md)
- How to config test environment on local machine: [here](/resources/docs/readme.env.md)
- How to config and run formatter: [here](/resources/docs/readme.formatter.md)
- How to config display monitors on local for debuggung: [here](/resources/docs/readme.monitors.md)
- How to config bitbucket local runners: [here](/configs/bitbucket-local-runner/readme.md)
* Custom tools:
    - Use custom snippet on VSCode to code faster: [here](/resources/docs/readme.custom-snippet.md)
    - Use ui-generator to generate UI file from Page file: [here](/resources/docs/readme.ui-generator.md)
* CICD:
    - How to use bitbucket pipeline and slack reporter: [here](resources/docs/readme.pipeline-slack.md)
# 2/ Project structure
- src: contains all of corebase, page object models, fixtures, supporting tools

- tests: contains all of testcase

- data: tests data

- configs: configs files for environment


- playwright-report: contains html/json report file
- husky: contains precommit trigger
- logs: logger output file
- resources: resource files like docs, media,...

*The role and using of each part will be detailed in its own readme.*


# 3/ Run test

## 3.1/ Local

-   Run all test

```bash
npx playwright test
```

-   Run only project by name

```bash
npx playwright test --project project-name
```

-   Run with browser

```bash
npx playwright test --headed
```

-   Run with trace viewer

```bash
npx playwright test --ui
```

## 3.2/ Run with docker

-   Run with container ("playwright-ui-cont") and project name("wp"/"delivery")

```bash
docker exec -it  playwright-ui-cont bash -c "npx playwright
 test --project delivery"
```

## 3.3/ Environment variable

Stored in .env file or go with command line

-   ENV: choose the test environment. Option: int, dev. Only use with test command line. Eg:

```bash
ENV=int npx playwright test --project delivery
```

-   HEADLESS: run on headless mode. HEADLESS=1 is requied for cloud environments. Only use with env file.
-   CI: marks the test being run on the CI flow. CI=1 is requied for cloud environments. Only use with env file.
-   WORKERS: number of parallel workers can run at a time. Varies based on machine configuration. Only use with env file.
-   SCREENSIZE: size of browser window. Only use with env file.
-   CAPTURE: store capture and stored in report or not. Only use with env file.
