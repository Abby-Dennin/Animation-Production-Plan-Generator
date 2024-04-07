// ParentComponent.tsx
import React, { useState, useEffect } from "react";
import PlanningForm from "./PlanningForm";
import SavedPlans from "./SavedPlans";
import logoImage from "../PPG Logo.png";

const ParentComponent = () => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [headerTextColor, setParentHeaderTextColor] = useState("#ffffff");
  const [cellTextColor, setParentCellTextColor] = useState("#000000");
  const [headerBgColor, setParentHeaderBgColor] = useState("#000000");
  const [cellBgColor1, setParentCellBgColor1] = useState("#ffffff");
  const [cellBgColor2, setParentCellBgColor2] = useState("#adadad");

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
        <img src={logoImage} alt="Logo" style={{ width: "100%", marginBottom: "20px" }} />
      <PlanningForm
        onSavePlan={onSavePlan}
        parentHeaderColor={headerTextColor}
        parentCellColor={cellTextColor}
        setHeaderTextColor={setParentHeaderTextColor}
        setCellTextColor={setParentCellTextColor}
        setHeaderBgColor={setParentHeaderBgColor}
        setCellBgColor1={setParentCellBgColor1}
        setCellBgColor2={setParentCellBgColor2}
      />
      <div style={{backgroundColor:'#b42e27' }}>
        <SavedPlans savedPlans={savedPlans} setSavedPlans={setSavedPlans}/>
      </div>
    </div>
  );
};

export default ParentComponent;