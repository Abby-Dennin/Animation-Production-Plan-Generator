// SavedPlans.tsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface SavedPlan {
  planName: string;
  data: any[][];
  headerColor: string;
  cellColor: string;
  tasks: boolean[]; 
}

interface Props {
  savedPlans?: SavedPlan[]; // Array of saved plans
  setSavedPlans: React.Dispatch<React.SetStateAction<SavedPlan[]>>;
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [], setSavedPlans }) => {
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const savedPlansData = localStorage.getItem("savedPlans");
        if (savedPlansData) {
        const parsedSavedPlans: SavedPlan[] = JSON.parse(savedPlansData);
        // Update the state with the saved plans
        setSelectedPlan(parsedSavedPlans.find(plan => plan.planName === selectedPlan?.planName) || null);
        }
    }, []);

    useEffect(() => {
        if (selectedPlan) {
        console.log("Use Effect Task statuses:", selectedPlan.tasks);
        }
    }, [selectedPlan]);

    // Function to toggle the completion status of a task
    const toggleTask = (index: number) => {

        const planToUpdate = savedPlans.find(plan => plan.planName === selectedPlan.planName);
        const updatedTasks = [...selectedPlan.tasks];
        updatedTasks[index] = !updatedTasks[index];
        planToUpdate.tasks = updatedTasks;
        setSelectedPlan({ ...selectedPlan, tasks: updatedTasks });
        localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
      };

  const handleButtonClick = (plan: SavedPlan) => {
    console.log("Task statuses:", plan.tasks);
    if (selectedPlan && selectedPlan.planName === plan.planName) {
      setShowDetails(!showDetails); // Toggle showDetails
    } else {
      setSelectedPlan(plan);
      setShowDetails(true); // Show details if a different plan is selected
    }
  };

  const handleExportCSV = () => {
    const csvRows = [];
    // Add header row
    const headerRow = [
        "Day",
        "Task",
        "Task Description",
        "Done"
    ].map(cell => `"${cell}"`).join(",");
    csvRows.push(headerRow);

    // Add data rows
    selectedPlan.data.forEach((row, rowIndex) => {
        const csvRow = row.map(cell => `"${cell}"`).join(",");
        const taskStatus = selectedPlan.tasks[rowIndex] ? "Yes" : "No"; // Convert task status to "Yes" or "No"
        const csvRowWithStatus = `${csvRow},"${taskStatus}"`; // Append task status to the row
        csvRows.push(csvRowWithStatus);
    });

    // Combine rows into CSV content
    const csvContent = csvRows.join("\n");

    // Download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedPlan.planName}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("Your browser does not support downloading files.");
    }
};


const deletePlan = (index: number) => {
    console.log("size: ", savedPlans.length);
    const updatedPlans = [...savedPlans];
    const planToDelete = updatedPlans[index];
    updatedPlans.splice(index, 1);
    setSavedPlans(updatedPlans);
    localStorage.setItem("savedPlans", JSON.stringify(updatedPlans));
    console.log("size: ", savedPlans.length);

    if (selectedPlan && selectedPlan.planName === planToDelete?.planName) {
        console.log("same!!: ", savedPlans.length);
        setShowDetails(false);
        setSelectedPlan(null);
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
                <button
                  className="btn btn-danger mb-3 ms-2"
                  onClick={() => deletePlan(index)}
                >
                  <FontAwesomeIcon icon={faTrash} />
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
                    <th style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>Day</th>
                    <th style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>Task</th>
                    <th style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>Task Description</th>
                    <th style={{ color: selectedPlan.headerColor, backgroundColor: selectedPlan.cellColor }}>Done</th> {/* Add "Done" column header */}
                </tr>
                </thead>
                <tbody>
                  {selectedPlan.data.slice(0).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} style={{ color: selectedPlan.cellColor }}>{cell}</td>
                      ))}
                      <td style={{ color: selectedPlan.cellColor }}>
                        {/* Render a cell for task completion with a checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedPlan.tasks[rowIndex]} // Check if task is completed
                          onChange={() => toggleTask(rowIndex) } // Toggle task completion status
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-success"
                onClick={handleExportCSV}
              >
                Export CSV
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedPlans;