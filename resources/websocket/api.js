const { createDynamoDbClient, executePutItem, executeDeleteItem } = require("./common");
const { TableName } = require("./constants")


async function connectHandler(event, context, callback) {
  console.info(event.requestContext);

  const connId = String(event.requestContext.connectionId);
  const client = createDynamoDbClient();
  const item = {
    TableName,
    Item: {
      rooCamera: { S: `websockets/${connId}` },
      captureTimeMs: { N: Date.now().toString() },
      connectionId: { S: connId }
    }
  }

  await executePutItem(client, item);
}

async function disconnectHandler(event, context, callback) {
  console.info(event.requestContext);

  const connId = String(event.requestContext.connectionId);
  const client = createDynamoDbClient();

  await executeDeleteItem(client, TableName, `websockets/${connId}`)
}

async function defaultHandler(event, context, callback) {
  console.info(event.requestContext);
  
}

module.exports = {
  connectHandler,
  disconnectHandler,
  defaultHandler
}
