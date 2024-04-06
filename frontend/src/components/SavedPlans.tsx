import React from "react";

interface Props {
  savedPlans?: any[]; // Array of saved plans
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [] }) => {
  return (
    <div className="container">
      <h2>My Plans</h2>
      {savedPlans.length === 0 ? (
        <p>No saved plans available.</p>
      ) : (
        <ul>
          {savedPlans.map((plan, index) => (
            <li key={index}>
              {/* Render plan title as a button */}
              <button className="btn btn-primary mb-3" onClick={() => handleButtonClick(plan)}>{plan.planName}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedPlans;