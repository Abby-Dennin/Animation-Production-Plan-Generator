// ParentComponent.tsx
import React, { useState } from "react";
import PlanningForm from "./PlanningForm";
import SavedPlans from "./SavedPlans";

const ParentComponent = () => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [headerColor, setParentHeaderColor] = useState("#ffffff");
  const [cellColor, setParentCellColor] = useState("#000000");

  const onSavePlan = (plan: any) => {
    setSavedPlans([...savedPlans, plan]);
  };

  return (
    <div>
      <PlanningForm
        onSavePlan={onSavePlan}
        parentHeaderColor={headerColor}
        parentCellColor={cellColor}
        setHeaderColor={setParentHeaderColor}
        setCellColor={setParentCellColor}
      />
      <SavedPlans savedPlans={savedPlans} />
    </div>
  );
};

export default ParentComponent;