import { DynamoItem } from "./base";
import { DateTime } from "luxon"

export const parseData = (res: DynamoItem[], plotItemLeft: string, plotItemRight?: string) => {
  return res.filter(item => item[plotItemLeft]).map(item => {
    const millis = Number(item["captureTimeMs"]["N"]);
    const date = DateTime.fromMillis(millis);
    const right = plotItemRight ? item[plotItemRight].S ?? item[plotItemRight].N : undefined;
    return {
      date: date.toJSDate(),
      plotItemLeft: Number(item[plotItemLeft].S ?? item[plotItemLeft].N),
      plotItemRight: right ? Number(right) : undefined
    }
  })
}
