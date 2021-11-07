import { ky } from "ky/distribution/types/ky";
import { SearchParamsOption } from "ky/distribution/types/options";

export type JsonResp = {
  [key: string]: any;
};

export type DynamoItem = {
	[key: string]: Partial<DynamoString> & Partial<DynamoNumber>
};

export type DynamoString = {
	S: string;
}

export type DynamoNumber = {
	N: string;
}

export class BaseService {
  ky: ky;

  constructor(ky: ky) {
    this.ky = ky.extend({
      // json: true
    });
  }
  
	async get<T extends JsonResp = JsonResp>(url: string, searchParams?: SearchParamsOption) {
		let body;
		try {
			const res = await this.ky.get(url, {
				searchParams
			}).json<T>();
			body = res;
		} catch (err) {
			console.error(err);
		}
		return body;
	}
  
	async post<T extends JsonResp = JsonResp>(url: string, json: {[key: string]: any}) {
		let body;
		try {
			const res = await this.ky.post(url, {
				json
			}).json<T>();
			body = res;
		} catch (err) {
			console.error(err);
		}
		return body;
	}
}
