// SavedPlans.tsx
import React, { useState } from "react";

interface SavedPlan {
  planName: string;
  data: any[][];
  headerColor: string;
  cellColor: string;
  tasks: boolean[]; 
}

interface Props {
  savedPlans?: SavedPlan[]; // Array of saved plans
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [] }) => {
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showDetails, setShowDetails] = useState(false);

    // Function to toggle the completion status of a task
    const toggleTask = (index: number) => {
        if (selectedPlan.tasks[index]) {
            selectedPlan.tasks[index] = false;
            const updatedTasks = [...selectedPlan.tasks]; // Create a copy of the tasks array
            updatedTasks[index] = false;
            setSelectedPlan({ ...selectedPlan, tasks: updatedTasks });
        }
        else {
            selectedPlan.tasks[index] = true;
            const updatedTasks = [...selectedPlan.tasks]; // Create a copy of the tasks array
            updatedTasks[index] = true;
            setSelectedPlan({ ...selectedPlan, tasks: updatedTasks });
        }
      };

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
                <button className="btn btn-primary mb-3" onClick={() => handleButtonClick(plan)}>
                  {plan.planName}
                </button>
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
                      <th key={index} style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>{header}</th>
                    ))}
                    <th style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>Done</th> {/* Add "Done" column header */}
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ color: selectedPlan.cellColor }}>{cell}</td>
                      ))}
                      <td style={{ color: selectedPlan.cellColor }}>
                        {/* Render a cell for task completion with a checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedPlan.tasks[rowIndex]} // Check if task is completed
                          onChange={() => toggleTask(rowIndex)} // Toggle task completion status
                        />
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
