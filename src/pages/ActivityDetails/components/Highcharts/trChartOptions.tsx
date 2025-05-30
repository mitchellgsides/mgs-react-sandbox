import type { DefaultTheme } from "styled-components";

export const CHART_HEIGHT = 300;
export const CHART_MARGIN_BOTTOM = 60;
export const CHART_MARGIN_TOP = 50;
export const RANGE_OFFSET = 80;
export const MOBILE_MARGIN_BOTTOM = 24;
export const CHART_MARGIN_FOR_HANDLES = 8;
export const CHART_SERIES_MARGIN = 15;

export const getTrChartOptions = (theme: DefaultTheme) => ({
  accessibility: { enabled: false },
  chart: {
    height: CHART_HEIGHT,
    reflow: true,
    alignTicks: false,
    animation: false,
    type: "area",
    ignoreHiddenSeries: false,
    backgroundColor: {
      linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
      stops: [
        [0, theme.colors.surface], // start
        [0.4, theme.colors.background], // middle
        [1, theme.colors.border], // end
      ],
    },
    margin: [50, 0, CHART_SERIES_MARGIN, 0],
    marginLeft: CHART_MARGIN_FOR_HANDLES,
    marginRight: CHART_MARGIN_FOR_HANDLES,
    spacingTop: 0,
    spacingRight: 0,
    panning: { enabled: true },
    panKey: "shift",
    spacing: [0, 10, 0, 10],
    style: {
      fontFamily: `"proxima-nova", "Helvetica Neue", Helvetica, Arial, sans-serif`,
    },
    events: {
      selection: (e) => {
        if (e.originalEvent && e.originalEvent.type.includes("mouse")) {
          return false;
        }
      },
      load: function () {
        this.yAxis[0].update(
          {
            // events: {
            //   afterSetExtremes: function (e) {
            //     setYAxisMinMax({ min: e.min, max: e.max });
            //   },
            // },
          },
          true
        );
      },
    },
    zooming: {
      pinchType: "x",
    },
    // @ts-expect-error zoomType: "x" is needed but not available in highcharts types - need to investigate and fix this type error
    zoomType: "x",
    selectionMarkerFill: "none",
  },
  exporting: {
    enabled: false,
  },
  series: buildSeries(
    dataPoints,
    chartData,
    isExternal,
    activityType,
    definedMetrics,
    showHrYAxis,
    isElvType
  ),
  loading: {
    labelStyle: {
      color: theme.colors.text,
    },
    style: {
      backgroundColor: theme.colors.surface,
    },
  },
  navigator: {
    adaptToUpdatedData: false,
    outlineWidth: 0,
    // top: 314,
    margin: 10,
    height: 36,
    enabled: isMainChart && showSummary,
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
      min: isExternal && hasElevation ? minElevation : null,
      max: isExternal && hasElevation ? maxElevation : null,
    },
    series: {
      data: isExternal
        ? showNavigatorElevation
          ? chartData.navLineData
          : []
        : chartData.workout,
      type: "area",
      color: colors.grey8,
      fillOpacity: 1,
      lineWidth: 0,
      lineColor: "transparent",
      fillColor: colors.grey8,
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
      symbols: getNavHandleImages(BASE_PATH),
    },
    maskFill: "rgba(0, 0, 0, 0.3)", // Color for the area outside handles
    maskInside: false,
    // maskBorderWidth: 0,
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
  xAxis: {
    events: {
      // selection: e => e.preventDefault(),
      setExtremes: (e) => {
        setExtremes([e.min, e.max]);
      },
    },
    min: isMainChart ? 0 : (interval && interval[0]) ?? 0,
    max: isMainChart
      ? dataPoints.length - 1
      : (interval && interval[1]) ?? dataPoints.length - 1,
    visible: true,
    type: "linear",
    startOnTick: false,
    endOnTick: false,
    tickColor: colors.grey9,
    lineColor: colors.grey9,
    tickPositioner: function (): Highcharts.AxisTickPositionsArray {
      if (domain === Domain.Distance && isMetric) return this.tickPositions;
      if (domain === Domain.Distance && !isMetric) {
        // We only need a custom positioner for distance when dealing with miles.
        // The default positioner will give us ticks like 2.32 miles. We want integer only ticks if possible.
        // It is OK to round up. Highcharts will discard positions that are outside of the chart
        const totalMiles = Math.ceil(Distance.fromMeters(this.max).miles);
        if (totalMiles <= 1) return this.tickPositions;
        const takeEveryNth = Math.ceil(totalMiles / this.tickPositions.length);
        return Range(0, totalMiles)
          .filter((i) => i % takeEveryNth === 0)
          .map((d) => Distance.fromMiles(d).meters)
          .toArray();
      }

      if (!showSummary) {
        const ticks: number[] = [];
        const maxTicks = 8;
        const tickInterval =
          Math.ceil((this.max - this.min) / 60 / (maxTicks - 1)) * 60;
        let tickValue = this.min;

        for (let i = 0; i < maxTicks; i++) {
          ticks.push(tickValue);
          tickValue += tickInterval;
        }
        return ticks;
      }

      // Convert the range to minutes
      const { dataMin, dataMax } = this.getExtremes();
      const rangeInMinutes = (dataMax - dataMin) / 60;

      // Determine the increment based on the range
      let increment: number; // in seconds
      if (rangeInMinutes <= 5) {
        increment = 15;
      } else if (rangeInMinutes <= 15) {
        increment = 60;
      } else if (rangeInMinutes <= 31) {
        increment = 120;
      } else if (rangeInMinutes <= 60) {
        increment = 300;
      } else if (rangeInMinutes <= 150) {
        increment = 600;
      } else if (rangeInMinutes <= 239) {
        increment = 900;
      } else if (rangeInMinutes <= 539) {
        increment = 1800;
      } else if (rangeInMinutes <= 1079) {
        increment = 3600;
      } else {
        increment = 7200; // Default to a 2-hour increment for ranges over 10 hours
      }

      const positions: Highcharts.AxisTickPositionsArray = [];
      for (let tick = Math.floor(dataMin); tick <= dataMax; tick += increment) {
        positions.push(tick);
      }

      return positions;
    },
    labels: {
      allowOverlap: false,
      y: 18,
      padding: 2,
      style: {
        fontSize: "10px",
        color: colors.grey10,
        fontFamily: "proxima-nova",
      },
      formatter: function () {
        if (domain === Domain.Distance) {
          // The distance values should be integers. However, if total distance is less 1 mi or 1km we will have decimal values.
          const distance = Distance.fromMeters(Number(this.value));
          const formatter = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0, // minimum number of fraction digits to use
            maximumFractionDigits: Number(this.value) < 1609 ? 2 : 0, // maximum number of fraction digits to use
          });

          return isMetric
            ? `${formatter.format(distance.kilometers)} km`
            : `${formatter.format(distance.miles)} mi`;
        }

        // Convert this.value (which should be in seconds) to a moment duration object
        const duration = moment.duration(this.value, "seconds");

        let format: string;
        if (duration.asHours() >= 1) {
          format = "HH:mm";
        } else {
          format = "mm:ss";
        }

        return moment.utc(duration.asMilliseconds()).format(format);
      },
    },
    crosshair: {
      width: CHART_CROSSHAIR_WIDTH,
      zIndex: 6,
      color: "#fff",
    },
  },
  yAxis: [
    {
      opposite: false,
      endOnTick: false,
      id: AxisType.Power,
      plotLines: isCyclingActivity
        ? [
            {
              color: "white",
              value: ftp,
              id: LineType.FtpPlotLine,
              label: {
                text: `FTP ${ftp}`,
                align: "right",
                x: -5,
                style: {
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                  fontFamily: "proxima-nova",
                  textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
                },
              },
              zIndex: 5,
              width: 1,
              // shadow: true,
            },
          ]
        : [],
      title: {
        text: "",
      },
      min: 0,
      max: (() => {
        switch (activityType) {
          case ActivityType.Cycling:
            return isMainChart ? 2 * ftp : Math.max(maxPower * 1.25, 2 * ftp);
          // max on running activities should be consistent for HR and cadence, this can be changed to scale how we'd like.
          default:
            return hasPower
              ? maxPower * 1.5
              : Math.max(225, 1.25 * maxHeartRate, 1.25 * maxCadence);
        }
      })(),
      gridLineColor:
        activityType === ActivityType.Cycling ? "#444444" : "transparent",
      labels: {
        align: "left",
        x: 5,
        y: -5,
        style: {
          fontSize: "9px",
          color: colors.grey12,
          fontFamily: "proxima-nova",
        },
        zIndex: 1,
        enabled: activityType === ActivityType.Cycling,
      },
      minRange: Math.max(ftp * 1.5, maxPower),
    },
    {
      id: AxisType.Elevation,
      startOnTick: false,
      endOnTick: false,
      min: minElevation,
      max: maxElevation,
      plotLines: [], // elevation axis
      title: {
        text: "",
      },
      gridLineColor: "transparent",
      // ticks: null,
      labels: {
        enabled: false,
      },
    },
    activityType === ActivityType.Cycling ||
    (isOtherActivity && !isPaceType(activityType))
      ? {
          id: AxisType.Speed,
          plotLines: [],
          title: {
            text: "",
          },
          gridLineColor: "transparent",
          min: 0,
          softMax: isMetric
            ? Speed.fromMetersPersecond(17.8816).kph
            : Speed.fromMetersPersecond(17.8816).mph,
          endOnTick: false,
        }
      : {
          id: AxisType.Pace,
          reversed: true,
          plotLines: [],
          title: {
            text: "",
          },
          gridLineColor: showHrYAxis ? "transparent" : "#444444",
          min: (() => {
            let min: number;
            if (activityType === ActivityType.Swimming) {
              const oneMinute = 1 * 60;
              const minSwimPace = convertSpeedToSwimPace(maxSpeed, isMetric);
              min = minSwimPace < oneMinute ? minSwimPace : oneMinute;
            } else {
              const sixMinuteMilePace = convertSpeedToPace(
                SIX_MINUTE_MILE_PACE_IN_METERS_PER_SECOND,
                isMetric
              );
              const minPace = convertSpeedToPace(maxSpeed, isMetric);
              min = minPace < sixMinuteMilePace ? minPace : sixMinuteMilePace;
            }
            return min;
          })(),
          max: (() => {
            switch (activityType) {
              case ActivityType.Swimming: {
                const fourMinutes = 4 * 60;
                const maxSwimPace = convertSpeedToSwimPace(minSpeed, isMetric);
                return maxSwimPace > fourMinutes
                  ? Math.min(maxSwimPace, fourMinutes * 2)
                  : fourMinutes;
              }
              default: {
                const paceFactor =
                  avgSpeed < SIX_MINUTE_MILE_PACE_IN_METERS_PER_SECOND / 6 // 36 min/mile
                    ? 4
                    : avgSpeed < SIX_MINUTE_MILE_PACE_IN_METERS_PER_SECOND / 4 // 24 min/mile
                    ? 3
                    : avgSpeed < SIX_MINUTE_MILE_PACE_IN_METERS_PER_SECOND / 2 // 12 min/mile
                    ? 2
                    : 1;
                return (
                  convertSpeedToPace(
                    FIFTEEN_MINUTE_MILE_PACE_IN_METERS_PER_SECOND,
                    isMetric
                  ) * paceFactor
                );
              }
            }
          })(),
          labels: {
            enabled: !showHrYAxis,
            align: "left",
            x: 5,
            y: -5,
            style: {
              fontSize: "9px",
              color: colors.grey12,
              fontFamily: "proxima-nova",
            },
            zIndex: 1,
            formatter: (
              context: Highcharts.AxisLabelsFormatterContextObject
            ) => {
              switch (activityType) {
                case ActivityType.Swimming:
                  return swimPaceString(
                    context.value as number,
                    isMetric,
                    false
                  );
                default:
                  return paceDecimalToMinutes(
                    context.value as number,
                    isMetric,
                    false
                  );
              }
            },
          },
          endOnTick: false,
          tickPositioner: function () {
            const ticks = [];
            const interval = (this.max - this.min) / 4; // Calculate interval for 5 ticks

            for (let i = 0; i < 5; i++) {
              ticks.push(this.min + interval * i);
            }

            return ticks;
          },
        },
    {
      id: AxisType.HeartRate,
      plotLines: [],
      title: {
        text: "",
      },
      gridLineColor: showHrYAxis ? "#444444" : "transparent",
      min: Math.min(minHeartRate, 50),
      max: Math.max(maxHeartRate, 180),
      endOnTick: false,
      labels: {
        align: "left",
        x: 5,
        y: -5,
        style: {
          fontSize: "9px",
          color: "#666",
          fontFamily: "proxima-nova",
        },
        zIndex: 1,
        enabled: showHrYAxis,
      },
    },
  ],
  rangeSelector: {
    enabled: false,
  },
  tooltip: {
    enabled: true,
    shared: true,
    formatter: getTooltipFormatter(
      domain,
      isMetric,
      activityType,
      isExternal,
      ftp,
      definedMetrics,
      poolUnitIsMetric,
      isElvType
    ),
    positioner: function (x, y, point) {
      return tooltipPositioner(x, y, point, isMainChart);
    },
    useHTML: true,
    outside: true,
    padding: 0,
    borderWidth: 0,
    shadow: false,
    backgroundColor: "rgba(255,255,255,0.95)",
    split: false,
    shape: "square",
    followTouchMove: true,
    hideDelay: 0,
  },
  legend: {
    enabled: isMainChart && showSummary,
    align: "right",
    verticalAlign: "top",
    floating: false,
    backgroundColor: null,
    borderColor: null,
    symbolWidth: 10,
    symbolHeight: 10,
    itemStyle: {
      color: colors.grey12,
      fontWeight: "400",
      fontFamily: "proxima-nova",
    },
    itemHoverStyle: {
      color: colors.grey15,
    },
    itemHiddenStyle: {
      opacity: 0.5,
    },
    symbolRadius: 0, // makes the legend symbol square
  },
  plotOptions: {
    series: {
      point: {
        events: {
          mouseOver: function (this: Highcharts.Point, _: Event) {
            setHoverTick(this.x);
          },
        },
      },
      dataGrouping: {
        groupPixelWidth: 1,
        enabled: true,
      },
      showCheckbox: false,
      turboThreshold: 0,
      states: {
        inactive: {
          enabled: false,
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
});
