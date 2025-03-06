import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";

export default function Coverage() {
  const [config, setConfig] = useState();
  const ref = useRef(null);
  const url = '/api/index.php?/api/v2/get_cases/1';
  let autoCases = [];
  let nonAutoCases = [];
  const countIdsBySection = (data) => {
    const sectionCount = data.reduce((acc, item) => {
      const section = item.sectionId;
      if (acc[section]) {
        acc[section]++;
      } else {
        acc[section] = 1;
      }
      return acc;
    }, {});
    return Object.keys(sectionCount).map((sectionId) => ({
      sectionId,
      count: sectionCount[sectionId]
    }));
  };
  React.useEffect(async () => {
    const data = await (await fetch(
            url,
            {
              headers: {
                Accept: "application/json",
              }
            })
    ).json();
    data.cases.map(item => {
      if (item.custom_automation_enabled === true) {
        autoCases.push({id: item.id, sectionId: item.section_id});
      } else {
        nonAutoCases.push({id: item.id, sectionId: item.section_id});
      }
    });
    const autoList = countIdsBySection(autoCases);
    const nonAutoList = countIdsBySection(nonAutoCases);
    console.log("auto", autoList);
    console.log("nonAuto", nonAutoList);
    processSectionsInParallel(autoList).then((newArray) => {
      const countSectionIds = (data) => { // TODO : 여기서부터 다시~~
        return data.reduce((acc, item) => {
          const existingSectionId = acc.find(entry => entry.sectionId === item.sectionId);
          if (existingSectionId) {
            existingSectionId.count += item.count;
          } else {
            acc.push({ sectionId: item.sectionId, name: item.name, count: item.count });
          }
          return acc;
        }, []);
      };
      console.log(countSectionIds);
    }).catch(error => {
      console.error("Error during API calls:", error);
    });
  }, []);
  async function fetchSectionData(sectionId) {
    const url = '/api/index.php?/api/v2/get_section/' + sectionId;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      }
    })
    return response.json();
  }
  async function processSectionsInParallel(data) {
    // 각 section에 대해 API 호출을 병렬로 진행
    const resultPromises = data.map(async (item) => {
      const count = item.count;
      const response = await fetchSectionData(item.sectionId); // section별 데이터 가져오기
      return {
        sectionId: response.parent_id ? response.parent_id : response.id,
        name: response.name,
        count: count,
      }
    });
    // 모든 API 호출이 완료된 후 결과 반환
    return Promise.all(resultPromises);
  }
  React.useEffect(async () => {
    // TODO : 섹션별로 size 및 자동화 비율 확인, 섹션별로 모아서 리스트를 만들고, 섹션별로 다시 get_section/{section_id} 호출해서 이름, 비율 넣어서
    let config = {
      type: "bar",
      data: {
        labels: ["section1", "section2"],
        datasets: [
          {
            label: "Automated",
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: [1, 2, 3],
            fill: false,
            barThickness: 20,
          },
          {
            label: "To Be Automated",
            backgroundColor: "#808080",
            borderColor: "#808080",
            data: [4, 5, 6],
            fill: false,
            barThickness: 20,
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
                stack: true,
              },
              gridLines: {
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(33, 37, 41, 0.3)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
              stacked: true,
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
                stack: true,
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
              stacked: true,
            },
          ],
        },
      },
    };
    setConfig(config);
  }, []);
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
                  영역별 테스트 자동화율
                </h2>
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
