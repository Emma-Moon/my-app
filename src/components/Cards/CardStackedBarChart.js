import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";

export default function Coverage() {
  const [config, setConfig] = useState();
  const ref = useRef(null);
  const [arrayWithSectionName, setArray] = useState([]);
  const [arrayWithParantName, setNewArray] = useState([]);
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
  async function fetchSectionData(sectionId) {
    const url = '/api/index.php?/api/v2/get_section/' + sectionId;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      }
    })
    return response.json();
  }
  async function processSectionsInParallel(data) { // parent id가 있으면 그걸로 통일하기
    // 각 section에 대해 API 호출을 병렬로 진행
    const resultPromises = data.map(async (item) => {
      const count = item.count;
      const nonAutoCount = item.nonAutoCount;
      const response = await fetchSectionData(item.sectionId); // section별 데이터 가져오기
      return {
        sectionId: response.parent_id ? response.parent_id : response.id,
        name: response.name,
        count: count,
        nonAutoCount: nonAutoCount
      }
    });
    // 모든 API 호출이 완료된 후 결과 반환
    return Promise.all(resultPromises);
  }
  async function fetchParentSectionData(sectionId) {
    const url = '/api/index.php?/api/v2/get_section/' + sectionId;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      }
    })
    return response.json();
  }
  async function processGetParentSectionNamesInParallel(data) {
    // 각 section에 대해 API 호출을 병렬로 진행
    let resultPromises = [];
    if (Array.isArray(data)) {
      resultPromises = data.map(async (item) => {
        const autoCount = item.autoCount;
        const nonAutoCount = item.nonAutoCount;
        const response = await fetchParentSectionData(item.sectionId); // section별 데이터 가져오기
        return {
          sectionId: response.id,
          name: response.name,
          autoCount: autoCount,
          nonAutoCount: nonAutoCount
        }
      });
    }
    // 모든 API 호출이 완료된 후 결과 반환
    return Promise.all(resultPromises);
  }
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
    // 배열 2개 합치기
    nonAutoList.forEach(item => {
      const existing = autoList.find(r => r.sectionId === item.sectionId);
      if (existing) {
        existing.nonAutoCount = item.count;
      } else {
        autoList.push({ sectionId: item.sectionId, autoCount: 0, nonAutoCount: item.count });
      }
    });
    console.log("auto", autoList);
    console.log("nonAuto", nonAutoList);
    processSectionsInParallel(autoList).then((newArray) => {
      console.log("newArray", newArray);
      const arrayWithParentId = newArray.reduce((acc, item) => {
        const existingSectionId = acc.find(entry => entry.sectionId === item.sectionId);
        if (existingSectionId) {
          existingSectionId.autoCount += (item.count ? item.count : 0);
          existingSectionId.nonAutoCount += (item.nonAutoCount ? item.nonAutoCount : 0);
        } else {
          acc.push({ sectionId: item.sectionId, name: item.name, autoCount: item.count !== undefined ? item.count : 0,
              nonAutoCount: item.nonAutoCount !== undefined ? item.nonAutoCount : 0 });
        }
        return acc;
      }, []);
      console.log("arrayWithParentId", arrayWithParentId);
      setArray(arrayWithParentId);
    }).catch(error => {
      console.error("Error during API calls:", error);
    });
  }, []);
  React.useEffect(() => {
    processGetParentSectionNamesInParallel(arrayWithSectionName).then((newArray) => {
      const arrayWithParentName = newArray.reduce((acc, item) => {
        acc.push({ sectionId: item.sectionId, name: item.name, autoCount: item.autoCount, nonAutoCount: item.nonAutoCount });
        return acc;
      }, []).sort((a, b) => b.autoCount - a.autoCount);
      console.log("arrayWithParentName", arrayWithParentName);
      setNewArray(arrayWithParentName);
    }).catch(error => {
      console.error("Error during API calls:", error);
    });
  }, [arrayWithSectionName]);
  React.useEffect(() => {
    const sectionName = arrayWithParantName.map(item => item.name);
    const autoCount = arrayWithParantName.map(item => item.autoCount);
    const nonAutoCount = arrayWithParantName.map(item => item.nonAutoCount);
    let config = {
      type: "bar",
      data: {
        labels: sectionName,
        datasets: [
          {
            label: "Automated",
            backgroundColor: "#ed64a6",
            borderColor: "#ed64a6",
            data: autoCount,
            fill: false,
            barThickness: 20,
          },
          {
            label: "To Be Automated",
            backgroundColor: "#808080",
            borderColor: "#808080",
            data: nonAutoCount,
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
              display: true,
              scaleLabel: {
                display: false,
                labelString: sectionName,
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
  }, [arrayWithParantName]);
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
                  영역별 테스트 자동화 현황
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
