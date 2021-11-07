const { DateTime } = require("luxon");
const { executeQuery } = require("./common");
const { TableName } = require("./constants")

/**
 * Get telemetry between two dates
 * @param {AWS.DynamoDB} client The dynamo client
 * @param {Object} args GET query parameters
 */
const getTelemetry = async (client, { fromDate, toDate, camera = "roopi1" }) => {
  const minCaptureTime = DateTime.fromISO(fromDate);
  const maxCaptureTime = DateTime.fromISO(toDate);

  const query = {
    TableName,
    "ScanIndexForward": true,
    "ConsistentRead": false,
    "KeyConditionExpression": "#rooCamera = :rooCamera And #captureTimeMs BETWEEN :minCaptureTimeMs AND :maxCaptureTimeMs",
    "ExpressionAttributeValues": {
      ":rooCamera": {
        "S": `${camera}/telemetry`
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

  return res && res.Items;
}

module.exports = {
  getTelemetry
}
