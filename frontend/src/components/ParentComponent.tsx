import React, { useState } from "react";
import PlanningForm from "./PlanningForm";
import SavedPlans from "./SavedPlans";

const ParentComponent = () => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [headerColor, setHeaderColor] = useState("#000000");
  const [cellColor, setCellColor] = useState("#ffffff");

  const onSavePlan = (plan: any) => {
    setSavedPlans([...savedPlans, plan]);
  };

  return (
    <div>
      <PlanningForm
        onSavePlan={onSavePlan}
        parentHeaderColor={headerColor}
        parentCellColor={cellColor}
        setHeaderColor={setHeaderColor}
        setCellColor={setCellColor}
      />
      <SavedPlans savedPlans={savedPlans} parentHeaderColor={headerColor} parentCellColor={cellColor} />
    </div>
  );
};

export default ParentComponent;