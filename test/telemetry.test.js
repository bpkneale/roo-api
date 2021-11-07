const { handler } = require("../resources/lambdas/telemetry");
const { main } = require("../resources/api/api");
const { expect } = require("chai");
const { DateTime } = require("luxon");

describe("Telemetry tests", () => {
  const context = {};

  it("Reads from SQS queue", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            generated_at: "2021-10-10T08:54:42.882793",
            roo_camera: "roopi1/telemetry",
            status: {
              GetBatteryCurrent: {
                data: -21,
                error: "NO_ERROR",
              },
              GetBatteryTemperature: {
                data: 25,
                error: "NO_ERROR",
              },
              GetBatteryVoltage: {
                data: 4149,
                error: "NO_ERROR",
              },
              GetButtonEvents: {
                data: {
                  SW1: "NO_EVENT",
                  SW2: "NO_EVENT",
                  SW3: "NO_EVENT",
                },
                error: "NO_ERROR",
              },
              GetChargeLevel: {
                data: 95,
                error: "NO_ERROR",
              },
              GetFaultStatus: {
                data: {},
                error: "NO_ERROR",
              },
              GetIoCurrent: {
                data: 962,
                error: "NO_ERROR",
              },
              GetIoVoltage: {
                data: 5035,
                error: "NO_ERROR",
              },
              GetStatus: {
                data: {
                  isFault: false,
                  isButton: false,
                  battery: "CHARGING_FROM_IN",
                  powerInput: "PRESENT",
                  powerInput5vIo: "NOT_PRESENT",
                },
                error: "NO_ERROR",
              },
            },
          }),
        },
      ],
    };

    const res = await handler(event, context);
  });

  it("Fetches telemetry from API", async () => {
    const event = {
      requestContext: {
        http: {
          method: "GET",
          path: "/telemetry",
        },
      },
      queryStringParameters: {
        fromDate: DateTime.now().startOf("day"),
        toDate: DateTime.now().endOf("day"),
      },
    };

    const res = await main(event, context);
    expect(res.statusCode).to.eq(200);
  });
});
