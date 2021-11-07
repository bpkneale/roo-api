const { DateTime } = require("luxon");

class RooPiModel {

  /** @type {String} */
  rooCamera;

  /** @type {Number} */
  captureTimeMs;

  /** @type {Number} */
  insertTimeMs;

  /** @type {String} */
  s3Key;

  /** @type {String} */
  state;

  /** @type {String} */
  inferenceResults;

  constructor({ 
    rooCamera, 
    captureTimeMs, 
    s3Key,
    inferenceResults = '',
    state = "created" }) 
  {
    this.rooCamera = rooCamera;
    this.captureTimeMs = captureTimeMs;
    this.s3Key = s3Key;
    this.state = state;
    this.inferenceResults = inferenceResults;
  }

  get Item() {
    return {
      rooCamera: { S: this.rooCamera },
      captureTimeMs: { N: String(this.captureTimeMs) },
      s3Key: { S: this.s3Key },
      insertTimeMs: { N: String(DateTime.now().toMillis()) },
      inferenceResults: { S: this.inferenceResults },
      state: { S: this.state },
    }
  }

}

module.exports = {
  RooPiModel
}
