// ParentComponent.tsx
import React, { useState } from "react";
import PlanningForm from "./PlanningForm";
import SavedPlans from "./SavedPlans";

const ParentComponent = () => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  const onSavePlan = (plan: any) => {
    setSavedPlans([...savedPlans, plan]);
  };

  return (
    <div>
      <PlanningForm onSavePlan={onSavePlan} />
      <SavedPlans savedPlans={savedPlans} />
    </div>
  );
};

export default ParentComponent;
