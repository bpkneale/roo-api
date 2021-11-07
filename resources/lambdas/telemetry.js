const { createDynamoDbClient, executePutItem } = require("./common");
const { TableName } = require("./constants");

const toDocument = (object) => {
  const output = {};
  Object.entries(object).forEach(([key, value]) => {
    if(typeof value === "number") {
      output[key] = { N: String(value) };
    } else if (typeof value === "boolean") {
      output[key] = { BOOL: value };
    } else {
      output[key] = { S: String(value) };
    }
  })
  return output;
}

exports.handler = async function(event, context) {
  const client = createDynamoDbClient();

  for(const record of event.Records) {
    const body = JSON.parse(record.body)
    console.log(body);
    /** @type {AWS.DynamoDB.PutItemInput} */
    const input = {
      TableName,
      Item: {
        rooCamera: {
          S: body.roo_camera
        },
        inserted_at: {
          N: String(Date.now())
        },
        captureTimeMs: {
          N: String(Date.parse(body.generated_at))
        }
      }
    }

    Object.entries(body.status).map(([key, value]) => {
      const asNumber = parseInt(value.data);
      if(isNaN(asNumber)) {
        console.debug(value.data);
        input.Item[key] = {
          M: toDocument(value.data)
        }
      } else {
        input.Item[key] = {
          N: String(asNumber)
        }
      }
      if(typeof(value.error) === "string") {
        input.Item[`${key}_error`] = { S: value.error };
      } else {
        input.Item[`${key}_error`] = { M: toDocument(value.error) };
      }
    })

    await executePutItem(client, input);
  }
  return {};
}
