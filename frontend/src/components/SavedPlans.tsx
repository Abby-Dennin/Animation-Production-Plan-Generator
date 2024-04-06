import React, { useState } from "react";

interface SavedPlan {
    planName: string;
    data: any[][];
  }

interface Props {
  savedPlans?: any[]; // Array of saved plans
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [] }) => {

    const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const handleButtonClick = (plan: SavedPlan) => {
        if (!showDetails) {
            setSelectedPlan(plan);
            setShowDetails(true);
        }
        else {
            setSelectedPlan(null);
            setShowDetails(false);
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
              {selectedPlan && (
                <div>
                  <h3>{selectedPlan.planName}</h3>
                  <table className="table">
                    <thead>
                      <tr>
                        {selectedPlan.data[0].map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlan.data.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
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