import { InputLabel, MenuItem, Select, TextField, Checkbox, CircularProgress } from "@material-ui/core"
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { RooService, TelemetryData } from "../service/roo";
import { Transition } from '@headlessui/react'
import { loadChart } from "../charts";
import { Chart } from "@amcharts/amcharts4/charts";
import { parseData } from "../service/utils";

const service = new RooService();

const PlotItems = [
  "GetBatteryCurrent",
  "GetBatteryTemperature",
  "GetBatteryVoltage",
  "GetChargeLevel",
  "GetIoCurrent",
  "GetIoVoltage",
]

export const Telemetry = () => {
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(DateTime.now().startOf("day"));
  const [data, setData] = useState<TelemetryData[] | undefined>(undefined);
  const [plotItemLeft, setPlotItemLeft] = useState("GetChargeLevel");
  const [plotItemRight, setPlotItemRight] = useState("GetBatteryVoltage");
  const [enPlotItemRight, setEnPlotItemRight] = useState(false);
  const [items, setItems] = useState(PlotItems);
  
  useEffect(() => {
    setLoading(true);
    service.getTelemetry(day.startOf("day"), day.endOf("day"))
      .then(res => {
        if(res) {
          setData(res);
        }
      })
      .finally(() => setLoading(false));
  }, [day])

  useEffect(() => {
    let chart: Chart | undefined;
    if(data) {
      chart = loadChart("telemetry-chart", parseData(data, plotItemLeft, enPlotItemRight ? plotItemRight : undefined), {})
    }
    return () => {
      if(chart) {
        chart.dispose();
      }
    }
  }, [data, plotItemLeft, plotItemRight])

  return <div className="flex flex-col h-full">
  <div className="flex flex-row overflow-auto">
    <div className="p-5">
      <TextField
        id="date"
        label="Day"
        type="date"
        onChange={(e) => {
          setDay(DateTime.fromJSDate((e.target as HTMLInputElement).valueAsDate as Date))
        }}
        defaultValue={day.toFormat("yyyy-MM-dd")}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </div>
    <div className="p-5">
      <InputLabel>Left plot</InputLabel>
      <Select
        value={plotItemLeft}
        onChange={e => setPlotItemLeft(e.target.value as string)}
      >
        {items.map(i => {
          return <MenuItem value={i}>{i}</MenuItem>
        })}
      </Select>
    </div>
    <div className="p-5">
      <InputLabel>Right plot</InputLabel>
      <Select
        value={plotItemRight}
        onChange={e => setPlotItemRight(e.target.value as string)}
      >
        {items.map(i => {
          return <MenuItem value={i}>{i}</MenuItem>
        })}
      </Select>
    </div>
    <div className="p-5">
      <Checkbox 
        value={enPlotItemRight}
        onChange={e => setEnPlotItemRight(e.target.checked)}
      />
    </div>
  </div>
    <div className="lg:m-5 h-full">
      <div id="telemetry-chart" className={`h-full transition duration-500 ${loading ? "opacity-20" : ""}`}></div>
      <Transition
        show={loading}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-500"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <aside className="absolute inset-2/4"><CircularProgress  /></aside>
      </Transition>
    </div>
</div>
}
