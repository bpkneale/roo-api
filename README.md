# Rooberry Pi

To deploy this application you'll first need to setup the Dynamo DB and S3 bucket separately, as I didn't want them to be part of the stack and be destroyed.

```bash
npm i
npm i -g @aws/cdk
cd resources/api
npm i
cd ../..
AWS_ACCOUNT_ID=<your_account_id> cdk deploy
```

Note that most of the ARNs are hardcoded for my account, so you'll need to adjust those.

Once you have finished playing around you can destroy the generated components:

```bash
AWS_ACCOUNT_ID=<your_account_id> cdk destroy
```
