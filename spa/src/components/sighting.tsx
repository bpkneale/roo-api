import { Button } from "@material-ui/core";
import { DateTime } from "luxon"
import { useState } from "react";
import { RooData, RooService } from "../service/roo"

type Props = {
  sighting: RooData;
}

const InferenceResultRe = /"(?<confidence>\d\.\d+): (?<label>\d+):(?<description>[\w, ]+)"/ig;

const service = new RooService();

const InterestedResults = [
  "kangaroo"
]

type InferenceResult = {
  confidence: number;
  description: string;
  label: number;
}

const parseInferenceResults = (infr: string) => {
  const matches: InferenceResult[] = [];
  let match: RegExpExecArray | null;
  while(( match = InferenceResultRe.exec(infr)) !== null ) {
    matches.push({
      confidence: parseFloat(match.groups?.confidence!),
      description: match.groups?.description!,
      label: parseInt(match.groups?.label!)
    });
  }
  return matches.sort((a, b) => {
    const bWeight = InterestedResults.some(res => b.description.toLowerCase().includes(res)) ? 1 : 0;
    const aWeight = InterestedResults.some(res => a.description.toLowerCase().includes(res)) ? 1 : 0;
    return (bWeight + b.confidence) - (aWeight + a.confidence)
  });
}

export const Sighting = (props: Props) => {
  const [focused, setFocused] = useState(false);
  const { sighting } = props;

  const results = parseInferenceResults(sighting.inferenceResults.S);
  const roo = results.some(r => r.description.toLowerCase().includes("kangaroo"));

  return <div key={sighting.s3Key.S} className="m-4 max-w-sm rounded overflow-hidden shadow-lg cursor-pointer"
    onClick={() => setFocused(!focused)}
    >
    <p className="p-4 text-center">{DateTime.fromMillis(parseInt(sighting.captureTimeMs.N)).toISO()}</p>
    <div className="px-4">
      {results.slice(0, 5).map(r => <p key={r.label} className="">{Math.ceil(r.confidence * 100)}%: {r.description}</p>)}
    </div>
    <img className="pt-4" src={sighting.s3SignedUrl}></img>
    { roo && <div className="flex justify-center justify-around p-2">
      <Button onClick={() => service.actionSighting(sighting, "confirmed")}>
        Yup, that's a roo
      </Button>
      <Button onClick={() => service.actionSighting(sighting, "dismissed")}>
        Not a roo!
      </Button>
    </div> }
  </div>
}
