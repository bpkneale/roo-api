import ky from "ky";
import { DateTime } from "luxon";
import { BaseService, DynamoNumber, DynamoString } from "./base";

export type RooData = {
	rooCamera: DynamoString;
	s3Key: DynamoString;
	state: DynamoString;
	inferenceResults: DynamoString;
	captureTimeMs: DynamoNumber;
	insertTimeMs: DynamoNumber;
	s3SignedUrl: string;
}

export type TelemetryData = {
	rooCamera: DynamoString;
	GetBatteryCurrent: DynamoNumber;
	GetBatteryTemperature: DynamoNumber;
	GetBatteryVoltage: DynamoNumber;
	GetChargeLevel: DynamoNumber;
	GetIoCurrent: DynamoNumber;
	GetIoVoltage: DynamoNumber;
}

export class RooService extends BaseService {

  constructor() {
		super(ky.extend({
			prefixUrl: process.env.REACT_APP_ROO_API ?? "https://3tppyzkh4g.execute-api.ap-southeast-2.amazonaws.com"
		}));
	}

	async getSightings(fromDate: DateTime, toDate: DateTime, kind: string) {
		return await this.get<RooData[]>("sightings", { fromDate: fromDate.toISO(), toDate: toDate.toISO(), kind });
	}

	async actionSighting(sighting: RooData, action: string) {
		return await this.post("action-sighting", {
			action,
			sighting
		})
	}

	async getTelemetry(fromDate: DateTime, toDate: DateTime) {
		return await this.get<TelemetryData[]>("telemetry", { fromDate: fromDate.toISO(), toDate: toDate.toISO() })
	}
}
