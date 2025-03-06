import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";
import {start} from "@popperjs/core";

export default function CardLineChart({platformName, workflowId}) {
  const [config, setConfig] = useState();
  const ref = useRef(null);
  React.useEffect(async () => { // 해당 run id list 구하기
    const data = await (
        await fetch(
            `https://api.github.com/repos/healingpaper/ui-test-automation/actions/runs?per_page=300`,
            {
              headers: {
                'Authorization': `token ${process.env.REACT_APP_GIT_API_TOKEN}`
              }
            })
    ).json();
    const runs = data.workflow_runs.map(item => {
      if (workflowId.includes(String(item.workflow_id))) {
        return item.id;
      }
      return null;
    }).filter(id => id !== null);
    console.log(`${workflowId}runss`, runs);
    const jobs = [];
    for (const runId of runs) { // 각 run에서 job 가져오기
      const data = await (
          await fetch(
              `https://api.github.com/repos/healingpaper/ui-test-automation/actions/runs/${runId}/jobs`,
              {
                headers: {
                  'Authorization': `token ${process.env.REACT_APP_GIT_API_TOKEN}`
                }
              })
      ).json();
      jobs.push(data.jobs.map(item => {
        return {"steps": item.steps, "url": item.html_url}
      }));
    }
    // deploy에 연계된 workflow의 경우, 처음에 app 설치하는 steps가 오게 됨 (단계가 최소 12개 이상)
    const steps = jobs.map(item => {
      if (item[0].steps.length > 11) {
        return { "steps": item[1].steps, "url": item[0].url };
      }
      return { "steps": item[0].steps, "url": item[0].url };
    });
    // test step 정보 가져오기
    const tests = steps.map(item => {
      let url = item.url;
      return item.steps.map(step => {
        if (step.name === "Run the tests" && step.conclusion === "success") {
          const runTime = (new Date(step.completed_at) - new Date(step.started_at)) / 1000;
          const date = String(new Date(step.completed_at).getMonth() + 1).padStart(2, '0') + "/"
              + String(new Date(step.completed_at).getDate()).padStart(2, '0');
          return { "date": date, "runTime": runTime, "url": url };
        }
      }).filter(value => value !== undefined);
    }).flat();
    console.log("Tests", tests);
    const runTime = tests.map(item => item.runTime).reverse();
    const date = tests.map(item => item.date).reverse();
    const workflowLink = tests.map(item => item.url).reverse();
    const config = {
      type: "line",
      data: {
        labels: date,
        datasets: [
          {
            label: "run time (s)",
            backgroundColor: "#4c51bf",
            borderColor: "#4c51bf",
            data: runTime,
            fill: false,
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Sales Charts",
          fontColor: "white",
        },
        legend: {
          labels: {
            fontColor: "white",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem) {
              const min = Math.floor(tooltipItem.value / 60);
              const sec = Math.floor(tooltipItem.value % 60);
              return `time: ${min}m${sec}s`;
            }
          }
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        onClick: (e, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0]._index;
            const link = workflowLink[index];
            if (link) {
              window.open(link, '_blank');
            }
          }
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Month",
                fontColor: "white",
              },
              gridLines: {
                display: false,
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(0, 0, 0, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
                fontColor: "white",
              },
              gridLines: {
                borderDash: [3],
                borderDashOffset: [3],
                drawBorder: false,
                color: "rgba(255, 255, 255, 0.15)",
                zeroLineColor: "rgba(33, 37, 41, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    setConfig(config);
  }, [platformName]);
  useEffect(() => {
    if (config && ref.current) {
      new Chart(ref.current, config);
    }
  }, [config]);
  return (
      <>
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-blueGray-700">
          <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <h2 className="text-white text-xl font-semibold">{platformName} 회귀테스트</h2>
                <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
                  테스트 수행 시간 (s)
                </h6>
              </div>
            </div>
          </div>
          <div className="p-4 flex-auto">
            {/* Chart */}
            <div className="relative h-350-px">
              <canvas ref={ref}/>
            </div>
          </div>
        </div>
      </>
  );
}
