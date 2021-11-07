import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

/* Chart code */
// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

export type Entry = {
  date: Date;
  plotItemLeft: number;
  plotItemRight?: number;
}

export type Options = {
  seriesNameLeft?: string;
  seriesNameRight?: string;
  type?: "xy" | "column";
}

export const loadChart = (selector: string, entries: Entry[], {
  seriesNameLeft,
  seriesNameRight,
  type = "xy"
}: Options) => {
  const chart = am4core.create(selector, am4charts.XYChart);
  
  chart.data = entries;
  
  // Create axes
  let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.minGridDistance = 60;
  
  chart.yAxes.push(new am4charts.ValueAxis());
  
  // Create series
  let series = chart.series.push(type === "xy" ? new am4charts.LineSeries() : new am4charts.ColumnSeries());
  series.dataFields.valueY = "plotItemLeft";
  series.dataFields.dateX = "date";
  series.tooltipText = "{plotItemLeft}"
  series.name = seriesNameLeft ?? "";

  if(series instanceof am4charts.ColumnSeries) {
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = .8;

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
  }
  
  if(entries.length > 0 && entries[0].plotItemRight) {
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    let series = chart.series.push(type === "xy" ? new am4charts.LineSeries() : new am4charts.ColumnSeries());

    if(series instanceof am4charts.ColumnSeries) {
      series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
      series.columns.template.fillOpacity = .8;
  
      const columnTemplate = series.columns.template;
      columnTemplate.strokeWidth = 2;
      columnTemplate.strokeOpacity = 1;
    }

    series.yAxis = valueAxis;
    series.dataFields.valueY = "plotItemRight";
    series.dataFields.dateX = "date";
    series.tooltipText = "{plotItemRight}"
    series.name = seriesNameRight ?? "";
    valueAxis.renderer.opposite = true;
  }
  
  if(series.tooltip) {
    series.tooltip.pointerOrientation = "vertical";
  }
  
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.snapToSeries = series;
  chart.cursor.xAxis = dateAxis;
  
  return chart;
}
