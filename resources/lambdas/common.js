const AWS = require("aws-sdk");

let LastError;

/**
 * @param {AWS.DynamoDB} dynamoDbClient The dynamo client
 */
async function executeScan(dynamoDbClient, scanInput) {
  // Call DynamoDB's scan API
  console.info(scanInput);
  let scanOutput;
  try {
    scanOutput = await dynamoDbClient.scan(scanInput).promise();
    console.info("Scan successful.");
    // Handle scanOutput
  } catch (err) {
    handleScanError(err);
  }
  return scanOutput;
}

/**
 * @param {AWS.DynamoDB} dynamoDbClient The dynamo client
 */
async function executeQuery(dynamoDbClient, queryInput) {
  // Call DynamoDB's query API
  console.info(queryInput);
  let queryOutput;
  try {
    queryOutput = await dynamoDbClient.query(queryInput).promise();
    console.info('Query successful.');
    // Handle queryOutput
  } catch (err) {
    handleQueryError(err);
  }
  return queryOutput;
}

/**
 * @param {AWS.DynamoDB} dynamoDbClient The dynamo client
 * @param {Object} item The item
 */
async function executePutItem(dynamoDbClient, item) {
  console.info(item);
  let queryOutput;
  try {
    queryOutput = await dynamoDbClient.putItem(item).promise();
    console.info('Put item successful.');
    // Handle queryOutput
  } catch (err) {
    handleQueryError(err);
    console.error(err);
  }
  return queryOutput;
}

// Handles errors during Query execution. Use recommendations in error messages below to 
// add error handling specific to your application use-case. 
function handleQueryError(err) {
  if (!err) {
    LastError = 'Encountered error object was empty'
    return;
  }
  if (!err.code) {
    LastError = `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(err)}`
    return;
  }
  // here are no API specific errors to handle for Query, common DynamoDB API errors are handled below
  handleCommonErrors(err);
}

// Handles errors during Scan execution. Use recommendations in error messages below to
// add error handling specific to your application use-case.
function handleScanError(err) {
  if (!err) {
    LastError = "Encountered error object was empty"
    return;
  }
  if (!err.code) {
    LastError = 
      `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(
        err
      )}`
    
    return;
  }
  // here are no API specific errors to handle for Scan, common DynamoDB API errors are handled below
  handleCommonErrors(err);
}

function handleCommonErrors(err) {
  switch (err.code) {
    case "InternalServerError":
        LastError = 
        `Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`
      
      return;
    case "ProvisionedThroughputExceededException":
        LastError = 
        `Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off. ` +
          `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`
      
      return;
    case "ResourceNotFoundException":
        LastError = 
        `One of the tables was not found, verify table exists before retrying. Error: ${err.message}`
      
      return;
    case "ServiceUnavailable":
        LastError = 
        `Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`
      
      return;
    case "ThrottlingException":
        LastError = 
        `Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`
      
      return;
    case "UnrecognizedClientException":
        LastError = 
        `The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying. ` +
          `Error: ${err.message}`
      
      return;
    case "ValidationException":
        LastError = 
        `The input fails to satisfy the constraints specified by DynamoDB, ` +
          `fix input before retrying. Error: ${err.message}`
      
      return;
    case "RequestLimitExceeded":
        LastError = 
        `Throughput exceeds the current throughput limit for your account, ` +
          `increase account level throughput before retrying. Error: ${err.message}`
      
      return;
    default:
        LastError = 
        `An exception occurred, investigate and configure retry strategy. Error: ${err.message}`
      
      return;
  }
}

function createDynamoDbClient(regionName) {
  // Set the region
  AWS.config.update({ region: regionName });
  // Use the following config instead when using DynamoDB Local
  if (["TEST", "LOCAL"].includes(process.env.ENV)) {
    AWS.config.update({
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "access_key_id",
      secretAccessKey: "secret_access_key",
    });
  }
  return new AWS.DynamoDB();
}

module.exports = {
  handleScanError,
  executeScan,
  executeQuery,
  executePutItem,
  handleCommonErrors,
  createDynamoDbClient,
  LastError
};
