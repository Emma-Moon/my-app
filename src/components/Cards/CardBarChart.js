import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";

export default function CardBarChart({runName}) {
  const [runList, setRunList] = useState([]);
  const ref = useRef(null);
  const [config, setConfig] = useState();
  const regex = /\d{4}\/(\d{2})\/(\d{2})/;
  let isWeb = false;
  let url;
  if (runName === "ANDROID_PROD_Regression") {
    url = '/api/index.php?/api/v2/get_plan/1837&limit=30';
  } else if (runName === "iOS_PROD_Regression") {
    url = '/api/index.php?/api/v2/get_plan/1833&limit=30';
  } else if (runName === "WEB_PROD_Regression") {
    url = '/api/index.php?/api/v2/get_runs/2&limit=30';
    isWeb = true;
  }
  let runs;
  React.useEffect(() => {
    fetch(url, {
      headers: {
        Accept: "application/json",
      }})
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (!isWeb) {
        runs = data.entries.map(entry => entry.runs.map(run => {
          return { "name": run.name, "date": run.name.match(regex)[1] + "/" + run.name.match(regex)[2],"passed": run.passed_count,
            "skipped": run.untested_count, "failed": run.failed_count, "url": run.url };
        }));
        runs = runs.flat();
      }
      else {
        runs = data.runs.map(run => {
          return { "name": run.name, "date": run.name.match(regex)[1] + "/" + run.name.match(regex)[2],"passed": run.passed_count,
            "skipped": run.untested_count, "failed": run.failed_count, "url": run.url };
        });
        runs = runs.reverse();
      }
      setRunList(runs.slice(-30));
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }, [runName])
  React.useEffect(() => {
    const date = runList.map(item => item.date);
    const passed = runList.map(item => item.passed);
    const failed = runList.map(item => item.failed);
    const skipped = runList.map(item => item.skipped);
    const url = runList.map(item => item.url);
    let config = {
      type: "bar",
      data: {
        labels: date,
        datasets: [
          {
            label: "Passed",
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: passed,
            fill: false,
            barThickness: 5,
          },
          {
            label: "Skipped",
            backgroundColor: "#808080",
            borderColor: "#808080",
            data: skipped,
            fill: false,
            barThickness: 5,
          },
          {
            label: "Failed",
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: failed,
            fill: false,
            barThickness: 5,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Orders Chart",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        onClick: (e, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0]._index;
            const link = url[index];
            if (link) {
              window.open(link, '_blank');
            }
          }
        },
        legend: {
          labels: {
            fontColor: "rgba(0,0,0,.4)",
          },
          align: "end",
          position: "bottom",
        },
        scales: {
          xAxes: [
            {
              display: false,
              scaleLabel: {
                display: true,
                labelString: "Month",
              },
              gridLines: {
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(33, 37, 41, 0.3)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
              },
              gridLines: {
                borderDash: [2],
                drawBorder: false,
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.2)",
                zeroLineColor: "rgba(33, 37, 41, 0.15)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    setConfig(config);
  }, [runList]);
  useEffect(() => {
    if (config && ref.current) {
      new Chart(ref.current, config);
    }
  }, [config]);
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h2 className="text-blueGray-700 text-xl font-semibold">
                {runName} 테스트 결과
              </h2>
              <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
                Pass/Fail
              </h6>
            </div>
          </div>
        </div>
        <div className="p-4 flex-auto">
          {/* Chart */}
          <div className="relative h-350-px">
            {/*<canvas id="bar-chart"></canvas>*/}
            <canvas ref={ref}/>
          </div>
        </div>
      </div>
    </>
  );
}
