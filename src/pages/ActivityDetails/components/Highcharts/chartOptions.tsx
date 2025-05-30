import type { Point } from "highcharts";
import type { DefaultTheme } from "styled-components";

export const tooltipPositioner = (
  x: number,
  y: number,
  point: Point,
  isMainChart: boolean
) => {
  const plotX = point?.plotX ?? 0;
  const tooltipX = plotX > x ? plotX - x - 25 : plotX + 25;
  const chartHeight = isMainChart ? 300 : 200;
  const yPosition = chartHeight / 2 - y / 2;
  return {
    x: tooltipX,
    y: yPosition,
  };
};

export const mgsChartOptions = (
  //   groupingInterval: number,
  formatTime: (milliseconds: number) => string,
  setZoomInfo: React.Dispatch<
    React.SetStateAction<{
      start: string;
      end: string;
    } | null>
  >,
  yAxes: {
    id: string;
    title: {
      text: string;
      style: {
        color: string;
      };
    };
    labels: {
      style?: {
        color: string;
      };
    };
    // opposite: boolean;
  }[],
  seriesData: (
    | false
    | {
        name: string;
        data: number[][];
        yAxis: string;
        type: string;
        color: string;
        tooltip: {
          valueSuffix: string;
        };
      }
  )[],
  theme: DefaultTheme
) => {
  // const minValues = seriesData.reduce((acc, series) => {
  //   if (series && series.data.length > 0) {
  //     const minValue = Math.min(...series.data.map((point) => point[1]));
  //     acc[series.yAxis] = Math.min(acc[series.yAxis] || 0, minValue);
  //   }
  //   return acc;
  // }, {} as Record<string, number>);

  // const maxValues = seriesData.reduce((acc, series) => {
  //   if (series && series.data.length > 0) {
  //     const maxValue = Math.max(...series.data.map((point) => point[1]));
  //     acc[series.yAxis] = Math.max(acc[series.yAxis] || 0, maxValue);
  //   }
  //   return acc;
  // }, {} as Record<string, number>);

  return {
    accessibility: {
      enabled: false,
    },
    chart: {
      height: 600,
      reflow: true,
      alignTicks: false,
      animation: false,
      type: "area",
      ignoreHiddenSeries: true,
      backgroundColor: "transparent",
      margin: [50, 40, 40, 80], // [top, right, bottom, left]
      spacingTop: 10,
      spacingRight: 20,
      spacingBottom: 10,
      spacingLeft: 10,
      style: {
        fontFamily: theme.fonts.main || "inherit",
      },
      events: {
        load: function (this: Highcharts.Chart) {
          // Ensure the chart is responsive
          const handleResize = () => {
            this.reflow();
          };
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
        },
      },
      selectionMarkerFill: "rgba(54, 54, 54, 0.25)",
      panning: { enabled: true },
      panKey: "shift",
      mouseWheel: { enabled: false },
      // events: {
      //   load: function () {
      //     // Chart loaded - default reset button will be automatically shown when zoomed
      //   },
      //   // selection: function (this: any, event: any) {
      //   //   console.log("Highstock selection event triggered:", event);
      //   //   if (event.xAxis && event.xAxis[0]) {
      //   //     const start = formatTime(event.xAxis[0].min);
      //   //     const end = formatTime(event.xAxis[0].max);
      //   //     setZoomInfo({ start, end });
      //   //   }
      //   //   return true; // Allow the zoom
      //   // },
      // },
      zooming: {
        type: "x",
        resetButton: {
          theme: {
            zIndex: 20,
          },
        },
      },
    },
    exporting: {
      enabled: false,
    },
    series: seriesData,
    loading: {
      labelStyle: {
        color: theme.colors.text,
      },
      style: {
        backgroundColor: theme.colors.surface,
      },
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "",
    },
    scrollbar: {
      enabled: false,
      liveRedraw: false,
    },
    // title: {
    //   text: `Activity Data - ${
    //     selectedActivity?.sport || "Unknown Sport"
    //   } (Highstock)`,
    //   style: {
    //     fontSize: "18px",
    //     fontWeight: "bold",
    //   },
    // },
    // subtitle: {
    //   text: `Drag to zoom in on time range • Native Highstock smoothing: ${
    //     groupingInterval === 1 ? "disabled" : `${groupingInterval}s`
    //   }`,
    // },
    xAxis: {
      min: 0,
      //   max: seriesData,
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterSetExtremes: function (this: any, event: any) {
          console.log("Highstock afterSetExtremes event triggered:", event);

          if (event.min !== undefined && event.max !== undefined) {
            // Set zoom info when extremes change
            if (event.trigger && event.trigger !== "updatedData") {
              const start = formatTime(event.min);
              const end = formatTime(event.max);
              setZoomInfo({ start, end });
            }

            // Clear zoom info if back to full range
            if (event.min === this.dataMin && event.max === this.dataMax) {
              setZoomInfo(null);
            }
          }
        },
      },
      //   type: "linear",
      title: {
        // text: "Active Time",
      },
      visible: true,
      type: "linear",
      startOnTick: false,
      endOnTick: false,
      tickColor: "grey",
      lineColor: "grey",
      labels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (this: any) {
          return formatTime(this.value);
        },
        allowOverlap: false,
        y: 18,
        padding: 2,
        style: {
          color: "grey",
        },
      },
      crosshair: {
        width: 2,
        zIndex: 6,
        color: theme.colors.text,
      },
    },
    yAxis: yAxes,
    rangeSelector: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      //   crosshairs: [
      //     {
      //       width: 1,
      //       color: "#666666",
      //       dashStyle: "solid",
      //     },
      //     false,
      //   ],
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: 4,
      shadow: true,
      useHTML: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (this: any) {
        const timeStr = formatTime(this.x);
        let tooltipContent = `<b>Time: ${timeStr}</b><br/>`;

        if (this.points) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.points.forEach((point: any) => {
            const suffix = point.series.tooltipOptions?.valueSuffix || "";
            tooltipContent += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}${suffix}</b><br/>`;
          });
        }

        return tooltipContent;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      positioner: function (x: number, y: number, point: any) {
        return tooltipPositioner(x, y, point, true);
      },
    },
    legend: {
      enabled: true,
      align: "right",
      verticalAlign: "top",
      floating: false,
      backgroundColor: null,
      borderColor: null,
      symbolWidth: 10,
      symbolHeight: 10,
      itemStyle: {
        color: theme.colors.text,
        fontWeight: "400",
        // fontFamily: "proxima-nova",
      },
      itemHoverStyle: {
        color: theme.colors.primary,
      },
      itemHiddenStyle: {
        opacity: 0.5,
      },
      symbolRadius: 0, // makes the legend symbol square
    },
    plotOptions: {
      series: {
        point: {},
        animation: false,
        dataGrouping: {
          enabled: true,
          groupPixelWidth: 1,
        },
        showCheckbox: false,
        turboThreshold: 0,
        marker: {
          enabled: false,
        },
        states: {
          inactive: {
            enabled: false,
          },
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mouseOver: function (this: any) {
            // Highlight all series when hovering over any series
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.chart.series.forEach((series: any) => {
              if (series !== this) {
                series.setState("hover");
              }
            });
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mouseOut: function (this: any) {
            // Remove hover state from all series
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.chart.series.forEach((series: any) => {
              series.setState("");
            });
          },
        },
      },
      line: {
        dataLabels: {
          enabled: false,
        },
        showCheckbox: false,
        lineWidth: 1,
        animation: false,
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
          marker: {
            enabled: false,
          },
        },
      },
      area: {
        dataLabels: {
          enabled: false,
        },
        fillOpacity: 1,
        animation: false,
        lineWidth: 1,
        shadow: false,
        hover: {
          enabled: false,
        },
        marker: {
          enabled: false,
        },
        states: {
          hover: {
            enabled: false,
          },
          marker: {
            enabled: false,
          },
        },
      },
    },
    navigator: {
      adaptToUpdatedData: false,
      outlineWidth: 0,
      //   top: 314,
      margin: 10,
      height: 36,
      enabled: true,
      xAxis: {
        labels: {
          enabled: false,
        },
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: "transparent",
        minorTickLength: 0,
        tickLength: 0,
        plotBands: [
          {
            from: 0,
            to: 0,
            color: "rgba(0, 100, 200, 0.5)",
            zIndex: 5,
          },
        ],
      },
      yAxis: {
        labels: {
          enabled: false,
        },
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: "transparent",
        minorTickLength: 0,
        tickLength: 0,
        startOnTick: false,
        endOnTick: false,
        min: 0,
        max: 1000,
      },
      series: {
        data: [],
        type: "area",
        color: "grey",
        fillOpacity: 1,
        lineWidth: 0,
        lineColor: "transparent",
        fillColor: "grey",
        dataGrouping: {
          // smoothed: true,
          approximation: null,
          enabled: false,
        },
        marker: {
          enabled: false,
        },
        shadow: false,
      },
      handles: {
        height: 36,
        width: 22,
        //   symbols: getNavHandleImages(BASE_PATH),
      },
      maskFill: "rgba(0, 0, 0, 0.3)", // Color for the area outside handles
      maskInside: false,
    },
  };
};
