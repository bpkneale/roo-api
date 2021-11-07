const { executeScan, executeQuery } = require("./common");
const { DateTime } = require("luxon");
const { range } = require("lodash");
const Bluebird = require("bluebird");

const getTotalWatts_obsolete = async (client, { days = 2 }) => {
  const midday =
    DateTime.utc().startOf("day").plus({ hours: 12 }).toMillis() / 1000.0;
  const betweens = {};
  for(const day of range(0, days)) {
    betweens[`:day${day}start`] = {
      N: String(midday - (day * 86400 + 60)),
    };
    betweens[`:day${day}end`] = {
      N: String(midday - (day * 86400 - 60)),
    };
  }
  const expression = range(0, days)
    .map((d) => `#f3103 BETWEEN :day${d}start AND :day${d}end`)
    .join(" Or ");

  const scan = {
    TableName: "RooData",
    ConsistentRead: false,
    FilterExpression: `${expression}`,
    ProjectionExpression: "#f3100,#f3101,#f3102",
    ExpressionAttributeValues: betweens,
    ExpressionAttributeNames: {
      "#f3100": "PAC_W",
      "#f3101": "publish_time",
      "#f3102": "TOTAL_ENERGY_Wh",
      "#f3103": "publish_time",
    },
  };

  return await executeScan(client, scan);
};

const getTotalWatts_obsolete2 = async (client, { minAge = 0, days = 30 }) => {
  const start = 
    DateTime.utc().startOf("day").toSeconds();

  const result = await Bluebird.map(range(Number(minAge), Number(minAge) + Number(days)), async day => {
    const query = {
      "TableName": "RooData",
      "ScanIndexForward": true,
      "ConsistentRead": false,
      "KeyConditionExpression": "#deviceId = :deviceId And #publishTime BETWEEN :minPublishTime AND :maxPublishTime",
      "ExpressionAttributeValues": {
        ":deviceId": {
          "S": "fronius-ben/end-of-day"
        },
        ":minPublishTime": {
          "N": String(start - (day * 86400))
        },
        ":maxPublishTime": {
          "N": String((start + 86400) - (day * 86400))
        }
      },
      "ExpressionAttributeNames": {
        "#deviceId": "device_id",
        "#publishTime": "publish_time"
      }
    }
    return await executeQuery(client, query);
  })

  return {
    Items: result.flatMap(r => r.Items)
  }
};

const getTotalWatts = async (client, { minAge = 0, days = 30 }) => {
  const end = 
    DateTime.utc().startOf("day").minus({ days: minAge });

  const start = end.minus({ days });

  const query = {
    "TableName": "RooData",
    "ScanIndexForward": true,
    "ConsistentRead": false,
    "KeyConditionExpression": "#deviceId = :deviceId And #publishTime BETWEEN :minPublishTime AND :maxPublishTime",
    "ExpressionAttributeValues": {
      ":deviceId": {
        "S": "fronius-ben/end-of-day"
      },
      ":minPublishTime": {
        "N": String(start.toSeconds())
      },
      ":maxPublishTime": {
        "N": String(end.toSeconds())
      }
    },
    "ExpressionAttributeNames": {
      "#deviceId": "device_id",
      "#publishTime": "publish_time"
    }
  }
  const res = await executeQuery(client, query);

  return {
    Items: res.Items
  }
};

const getDayWatts = async (client, { timestamp, zone = "Australia/Perth" }) => {
  const day = DateTime.fromFormat(timestamp, "yyyy/MM/dd", {
    zone
  });
  const start = day.startOf("day").toSeconds();

  const query = {
    "TableName": "RooData",
    "ScanIndexForward": true,
    "ConsistentRead": false,
    "KeyConditionExpression": "#deviceId = :deviceId And #publishTime BETWEEN :minPublishTime AND :maxPublishTime",
    "ExpressionAttributeValues": {
      ":deviceId": {
        "S": "fronius-ben"
      },
      ":minPublishTime": {
        "N": String(start)
      },
      ":maxPublishTime": {
        "N": String(start + (24 * 60 * 60))
      }
    },
    "ExpressionAttributeNames": {
      "#deviceId": "device_id",
      "#publishTime": "publish_time"
    }
  }
  const result = await executeQuery(client, query);

  return {
    Items: result.Items
  } 
};

module.exports = {
  getTotalWatts,
  getDayWatts
};
