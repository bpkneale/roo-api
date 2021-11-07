import { TextField, CircularProgress, InputLabel, Select, MenuItem, Button } from "@material-ui/core"
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { RooData, RooService } from "../service/roo";
import { Sighting } from "../components/sighting";
import { useHistory } from "react-router";
import qs from "query-string";

const service = new RooService();
const sightingKinds = {
  ["Sighting"]: "sighting",
  ["Periodic"]: "periodic"
}

const parseHistory = (history: ReturnType<typeof useHistory>) => {
  const parsed = qs.parse(history.location.search);
  const defaultFromDate = parsed.fromDate ? DateTime.fromISO(parsed.fromDate.toString()) : null;
  const defaultToDate = parsed.toDate ? DateTime.fromISO(parsed.toDate.toString()) : null;
  const defaultKind = parsed.kind?.toString() ?? "sighting";
  return {
    defaultFromDate: defaultFromDate ?? DateTime.now().startOf("day"),
    defaultToDate: defaultToDate ?? DateTime.now().endOf("day"),
    defaultKind
  }
}

export const Sightings = (props: {}) => {
  const history = useHistory();

  const { defaultFromDate, defaultToDate, defaultKind } = parseHistory(history);

  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [data, setData] = useState<RooData[] | undefined>(undefined);
  const [kind, setKind] = useState<string>(defaultKind);

  useEffect(() => {
    setLoading(true);
    service.getSightings(fromDate, toDate, kind)
      .then(res => {
        if(res) {
          setData(res);
        }
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate, kind])

  return <div className="flex flex-col h-full">
    <div className="flex flex-row overflow-auto">
      <div className="p-5">
        <TextField
          id="date"
          label="From date"
          type="date"
          onChange={(e) => {
            setFromDate(DateTime.fromJSDate((e.target as HTMLInputElement).valueAsDate as Date))
          }}
          defaultValue={fromDate.toFormat("yyyy-MM-dd")}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div className="p-5">
        <TextField
          id="date"
          label="To date"
          type="date"
          onChange={(e) => {
            setToDate(DateTime.fromJSDate((e.target as HTMLInputElement).valueAsDate as Date))
          }}
          defaultValue={toDate.toFormat("yyyy-MM-dd")}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div className="p-5">
        <InputLabel>Sighting type</InputLabel>
        <Select
          value={kind}
          onChange={e => setKind(e.target.value as string)}
        >
          {Object.entries(sightingKinds).map(([label, value]) => {
            return <MenuItem value={value}>{label}</MenuItem>
          })}
        </Select>
      </div>
      <div className="p-5">
        <Button
          onClick={() => {
            const url = qs.stringifyUrl({ url: window.location.href,
              query: {
                fromDate: fromDate.toISO(),
                toDate: toDate.toISO(),
                kind
              }
            })
            navigator.clipboard.writeText(url);
          }}
        >Copy link</Button>
      </div>
    </div>
    <div className="flex-grow flex justify-center items-center flex-wrap">
      { loading ? 
        <CircularProgress />
      :
        (data === undefined || data.length === 0) ? 
        <p>No data for this search range :(</p>
      :
      <div className="flex flex-wrap align-start justify-around">
        {data?.map(d => <Sighting sighting={d} />)}
      </div>
      }
    </div>
  </div>
}
