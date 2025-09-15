## Bitbucket pipelines
### How to config pipeline job
- Edit file bitbucket-pipelines.yml, based on this [instruction](https://support.atlassian.com/bitbucket-cloud/docs/bitbucket-pipelines-configuration-reference/)

### Run job manually
- Go to the repository
- Go to Pipelines
- Click Run Pipelines
- Choose the branch and pipeline you want to run

### Create a schedule
- Go to Pipelines
- Click Schedules
- Choose branch, job and time schedule you want to run

## Slack configuration
- Go to the repository
- Go to Deployments
- Click Settings button
- Choose the deployment setting you want to config
- There are 2 fields you can configs:
    + SLACK_CHANNEL_ID: id of slack channel which will received report messages
    + REPORTED_SLACK_MEMBERS: list of members name, based on their email, such as "nam.nhat.tran", this list is split by ",". Example: "name.of.first,name.of.second"
- How to get SLACK_CHANNEL_ID:
    + Open Slack, go to your channel, click to see channel detail information, copy Channel ID
- How to get and config members id:
    + Open Slack, choose a member, click to see user detail information, click Copy member ID
    + Open and update file configs/members.json
