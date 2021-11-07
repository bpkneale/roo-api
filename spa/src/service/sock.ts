import { BaseService } from "./base";
import ky from "ky";

const URL = process.env.REACT_APP_WEBSOCKET_API ?? "d-x6ph9ezoue.execute-api.ap-southeast-2.amazonaws.com"

export class WebsocketService {
  // static client = new WebSocket(URL);

  // static async connect() {
  //   this.client.
  // }
}
