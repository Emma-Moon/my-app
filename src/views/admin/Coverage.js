import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js";
import {auto} from "@popperjs/core";
import CardStackedBarChart from "../../components/Cards/CardStackedBarChart";
import CardPieChart from "../../components/Cards/CardPieChart";

export default function Coverage() {
  return (
      <>
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 px-4">
            <CardPieChart />
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 px-4">
            <CardStackedBarChart />
          </div>
        </div>
      </>
  );
}
