const AWS = require("aws-sdk");
const { createSighting, getSightings } = require("./sighting");
const region = "ap-southeast-2";
const { get } = require("lodash");
const { LastError } = require("./common");
const { getTelemetry } = require("./telemetry");

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

const routes = {
  "GET": {
    "/": () => {
      return { healthy: true };
    },
    "/sightings": getSightings,
    "/telemetry": getTelemetry
  },
  "POST": {
    "/sighting": createSighting
  }
};

const headers = {
  ["Access-Control-Allow-Origin"]: "*",
  ["Access-Control-Allow-Methods"]: "*"
}

exports.main = async function (event, context) {
  const dynamoDbClient = createDynamoDbClient(region);
  try {
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
    console.info(JSON.stringify(event));

    const handler = get(routes, `${method}.${path}`);
    const body = event.queryStringParameters || JSON.parse(event.body);

    if (handler) {
      let result = await handler(dynamoDbClient, body);
      let statusCode = 200;

      if(LastError) {
        console.error(LastError);
      }
      if(!result) {
        statusCode = 400;
        result = { message: LastError }
      }
      console.info(result);

      return {
        statusCode,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Path not found" }),
      };
    }

  } catch (error) {
    console.error(error);
    var body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify(body),
    };
  }
};
