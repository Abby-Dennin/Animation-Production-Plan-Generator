// SavedPlans.tsx
import React, { useState } from "react";

interface SavedPlan {
  planName: string;
  data: any[][];
}

interface Props {
  savedPlans?: SavedPlan[]; // Array of saved plans
  parentHeaderColor: string; // Header color selected in PlanningForm
  parentCellColor: string; // Cell color selected in PlanningForm
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [], parentHeaderColor, parentCellColor }) => {
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleButtonClick = (plan: SavedPlan) => {
    if (selectedPlan && selectedPlan.planName === plan.planName) {
      setShowDetails(!showDetails); // Toggle showDetails
    } else {
      setSelectedPlan(plan);
      setShowDetails(true); // Show details if a different plan is selected
    }
  };

  return (
    <div className="container">
      <h2>My Plans</h2>
      {savedPlans.length === 0 ? (
        <p>No saved plans available.</p>
      ) : (
        <>
          <ul>
            {savedPlans.map((plan, index) => (
              <li key={index}>
                {/* Render plan title as a button */}
                <button className="btn btn-primary mb-3" onClick={() => handleButtonClick(plan)}>{plan.planName}</button>
              </li>
            ))}
          </ul>
          {selectedPlan && showDetails && (
            <div>
              <h3>{selectedPlan.planName}</h3>
              <table className="table">
                <thead>
                  <tr>
                    {selectedPlan.data[0].map((header, index) => (
                      <th key={index} style={{ color: parentHeaderColor, backgroundColor: parentCellColor }}>{header}</th>
                    ))}
                    <th style={{ color: parentHeaderColor, backgroundColor: parentCellColor }}>Done</th> {/* Add "Done" column header */}
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ color: parentCellColor }}>{cell}</td>
                      ))}
                      <td style={{ color: parentCellColor }}>
                        {/* Render a cell for "Done" with a dropdown menu */}
                        <select>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedPlans;