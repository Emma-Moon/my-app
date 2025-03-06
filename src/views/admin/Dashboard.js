import React from "react";

// components

import CardLineChart from "components/Cards/CardLineChart.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import CardPageVisits from "components/Cards/CardPageVisits.js";
import CardSocialTraffic from "components/Cards/CardSocialTraffic.js";

export default function Dashboard() {
  const iosWorkflowIds = ["123264463", "139247578"];
  const andWorkFlowIds = ["123267413", "139247577"];
  const webWorkflowIds = ["128770705", "118837625"];
  return (
      <>
        <div className="flex flex-wrap">
          <div className="w-full xl:w-8/12 px-4">
            <CardBarChart runName={"iOS_PROD_Regression"}/>
          </div>
          <div className="w-full xl:w-8/12 px-4">
            <CardBarChart runName={"ANDROID_PROD_Regression"}/>
          </div>
          <div className="w-full xl:w-8/12 px-4">
            <CardBarChart runName={"WEB_PROD_Regression"}/>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full xl:w-4/12 mb-12 xl:mb-0 px-4">
            <CardLineChart platformName={"iOS"} workflowId={iosWorkflowIds}/>
          </div>
          <div className="w-full xl:w-4/12 mb-12 xl:mb-0 px-4">
            <CardLineChart platformName={"Android"} workflowId={andWorkFlowIds}/>
          </div>
          <div className="w-full xl:w-4/12 mb-12 xl:mb-0 px-4">
            <CardLineChart platformName={"Web"} workflowId={webWorkflowIds}/>
          </div>
        </div>
      </>
  );
}
