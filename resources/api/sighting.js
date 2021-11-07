const { DateTime } = require("luxon");
const { executePutItem, executeQuery } = require("./common");
const { TableName, Bucket } = require("./constants");
const { RooPiModel } = require("./model");
const AWS = require("aws-sdk");
const { get } = require("lodash");

const s3 = new AWS.S3({
  region: "ap-southeast-2"
});

/**
 * Create a sighting, linking to an existing S3 upload
 * @param {AWS.DynamoDB} client The dynamo client
 * @param {Object} args POST body
 */
const createSighting = async (client, { rooCamera, captureTimeMs, s3Key, inferenceResults }) => {

  const model = new RooPiModel({
    rooCamera,
    captureTimeMs,
    s3Key,
    inferenceResults
  })

  /** @type {AWS.DynamoDB.PutItemInput} */
  const item = {
    TableName,
    Item: model.Item
  }

  return await executePutItem(client, item);
}

/**
 * Get sightings created for a date range
 * @param {AWS.DynamoDB} client The dynamo client
 * @param {Object} args GET query parameters
 */
const getSightings = async (client, { fromDate, toDate, camera = "roopi1", kind = "sighting" }) => {
  const minCaptureTime = DateTime.fromISO(fromDate, { zone: "UTC" });
  const maxCaptureTime = DateTime.fromISO(toDate, { zone: "UTC" });

  const query = {
    TableName,
    "ScanIndexForward": true,
    "ConsistentRead": false,
    "KeyConditionExpression": "#rooCamera = :rooCamera And #captureTimeMs BETWEEN :minCaptureTimeMs AND :maxCaptureTimeMs",
    "ExpressionAttributeValues": {
      ":rooCamera": {
        "S": `${camera}/${kind}`
      },
      ":minCaptureTimeMs": {
        "N": String(minCaptureTime.toMillis())
      },
      ":maxCaptureTimeMs": {
        "N": String(maxCaptureTime.toMillis())
      }
    },
    "ExpressionAttributeNames": {
      "#rooCamera": "rooCamera",
      "#captureTimeMs": "captureTimeMs"
    }
  }
  const res = await executeQuery(client, query);

  let items = res.Items;

  for(const item of items) {
    item.s3SignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket,
      Key: get(item, 's3Key.S'),
      Expires: 60 * 5
    })
  }

  return items
}

module.exports = {
  createSighting,
  getSightings
}
