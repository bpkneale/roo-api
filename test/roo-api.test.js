const { main } = require("../resources/api/api");
const { expect } = require("chai");
const { DateTime } = require("luxon");
const AWS = require("aws-sdk");

function createDynamoDbClient(regionName) {
  AWS.config.update({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "access_key_id",
    secretAccessKey: "secret_access_key",
  });
  return new AWS.DynamoDB();
}

before(async () => {
  const client = createDynamoDbClient();

  const table = {
    TableName: "RooPi",
    KeySchema: [
      {
        AttributeName: "rooCamera",
        KeyType: "HASH", //Partition key
      },
      {
        AttributeName: "captureTimeMs",
        KeyType: "RANGE", //Sort key
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "rooCamera",
        AttributeType: "S",
      },
      {
        AttributeName: "captureTimeMs",
        AttributeType: "N",
      },
    ],
    ProvisionedThroughput: {
      // Only specified if using provisioned mode
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  console.info("Creating table ", table);
  try {
    await client.createTable(table).promise();
  } catch (err) {}
});

describe("Unit tests", () => {
  const context = {};

  it("Create a sighting", async () => {
    const event = {
      requestContext: {
        http: {
          method: "POST",
          path: "/sighting",
        },
      },
      queryStringParameters: {
        rooCamera: "roopi1/sighting",
        captureTimeMs: DateTime.now().toMillis(),
        s3Key: "test",
      },
    };

    const res = await main(event, context);
    expect(res.statusCode).to.eq(200);
    console.info(res.body);
    const bodice = JSON.parse(res.body);
    console.info(bodice);
  });

  it("Get a sighting", async () => {
    const event = {
      requestContext: {
        http: {
          method: "GET",
          path: "/sightings",
        },
      },
      queryStringParameters: {
        camera: "roopi1",
        fromDate: DateTime.now().startOf("day"),
        toDate: DateTime.now().endOf("day"),
      },
    };

    const res = await main(event, context);
    expect(res.statusCode).to.eq(200);
    console.info(res.body);
    const bodice = JSON.parse(res.body);
    console.info(bodice);
  });
});
