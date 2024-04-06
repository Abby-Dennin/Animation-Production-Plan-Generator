// ParentComponent.tsx
import React, { useState, useEffect } from "react";
import PlanningForm from "./PlanningForm";
import SavedPlans from "./SavedPlans";

const ParentComponent = () => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [headerColor, setParentHeaderColor] = useState("#ffffff");
  const [cellColor, setParentCellColor] = useState("#000000");

  useEffect(() => {
    // Load saved plans from localStorage when component mounts
    const storedPlans = localStorage.getItem("savedPlans");
    if (storedPlans) {
      setSavedPlans(JSON.parse(storedPlans));
    }
  }, []);

  const onSavePlan = (plan: SavedPlan) => {
    // Add the current plan to the list of saved plans
    const updatedPlans = [...savedPlans, plan];
    setSavedPlans(updatedPlans);
    // Store the updated plans in localStorage
    localStorage.setItem("savedPlans", JSON.stringify(updatedPlans));
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
      <SavedPlans savedPlans={savedPlans} setSavedPlans={setSavedPlans}/>
    </div>
  );
};

export default ParentComponent;