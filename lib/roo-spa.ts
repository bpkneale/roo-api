import * as core from "@aws-cdk/core";
import * as codecommit from "@aws-cdk/aws-codecommit";
import * as amplify from "@aws-cdk/aws-amplify";
import { CustomRule } from "@aws-cdk/aws-amplify";

type Props = {
  apiUrl: string;
  websocketApiUrl: string;
}

export class RooSpa extends core.Construct {
  constructor(scope: core.Construct, id: string, { apiUrl, websocketApiUrl }: Props) {
    super(scope, id);

    // Assumes you have commited this repo to AWS code commit
    const solarRepo = codecommit.Repository.fromRepositoryName(this, "solarRepo", "roo-api");

    const amplifyApp = new amplify.App(this, "roo-spa", {
      sourceCodeProvider: new amplify.CodeCommitSourceCodeProvider({
        repository: solarRepo,
      }),
      environmentVariables: {
        REACT_APP_ROO_API: apiUrl,
        REACT_APP_WEBSOCKET_API: websocketApiUrl
      }
    });
    amplifyApp.addCustomRule(CustomRule.SINGLE_PAGE_APPLICATION_REDIRECT);
    const masterBranch = amplifyApp.addBranch("master");
  }
}