import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";

export default function Coverage() {
  const [config, setConfig] = useState();
  const ref = useRef(null);
  const url = '/api/index.php?/api/v2/get_cases/1';
  let size;
  let autoCount = 0;
  React.useEffect(async () => {
    const data = await ( await fetch(
            url,
            {
              headers: {
                Accept: "application/json",
              }
            })
    ).json();
    size = data.size;
    data.cases.map(item => {
      if (item.custom_automation_enabled === true) {
        autoCount += 1;
      }
    });
    const autoRatio = Math.floor(autoCount/size * 100);
    const config = {
      type:"pie",
      data: {
        datasets: [
          {
            data: [autoRatio, (100 - autoRatio)],
            backgroundColor: [
              "#ed64a6",
              "#808080",
            ],
          }
        ],
        labels: ["자동화된 케이스(%)", "자동화되지 않은 케이스(%)"],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "모바일 TC 자동화 비율",
        },
      }
    };
    setConfig(config);
  }, []);
  useEffect(() => {
    if (config && ref.current) {
      new Chart(ref.current, config);
    }
  }, [config]);
  return (
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h2 className="text-blueGray-700 text-xl font-semibold">
                모바일 테스트 케이스 자동화율
              </h2>
            </div>
          </div>
        </div>
        <div>
          <canvas ref={ref} style={{width: "300px", height: "300px"}} />
        </div>
      </div>
  );
}
