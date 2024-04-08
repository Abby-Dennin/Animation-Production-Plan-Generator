// SavedPlans.tsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

interface SavedPlan {
  planName: string;
  data: any[][];
  headerTextColor: string;
  cellTextColor: string;
  headerBgColor: string;
  cellBgColor1: string;
  cellBgColor2: string;
  tasks: boolean[]; 
}

interface Props {
  savedPlans?: SavedPlan[]; // Array of saved plans
  setSavedPlans: React.Dispatch<React.SetStateAction<SavedPlan[]>>;
}

const SavedPlans: React.FC<Props> = ({ savedPlans = [], setSavedPlans }) => {
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [tableWidth, setTableWidth] = useState<number | null>(null);

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
        const totalColumnWidth = 700; // Assuming each column has a width of 100px
        setTableWidth(totalColumnWidth);
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
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between'}}>
      <div style={{ flex: '1', padding: '20px' }}>
        <h2 style={{color: '#ffffff'}}>My Plans</h2>
              <ul  style={{color: '#ffffff'}}>
                {savedPlans.map((plan, index) => (
                  <li key={index}>
                    {/* Render plan title as a button */}
                    <button className="btn btn-primary mb-3" onClick={() => handleButtonClick(plan)} style={{ backgroundColor: '#ff9900', borderColor: '#c73c34' }}>
                      {plan.planName}
                    </button>
                    <button
                      className="btn btn-danger mb-3 ms-2"
                      onClick={() => deletePlan(index)}
                      style={{backgroundColor: 'transparent',border: '1px solid white'}}
                    > 
                       <FontAwesomeIcon icon={faTrashCan}  style={{ color: '#ffffff'}}/>
                    </button>
                  </li>
                ))}
              </ul>
      </div>
      <div style={{padding: '20px', color: '#ffffff'}}>
        {savedPlans.length === 0 ? (
          <p>...no saved plans available.</p>
        ) : (
          <>
            {selectedPlan && showDetails && (
              <div>
                <h3 style={{color: '#ffffff'}}>{selectedPlan.planName}</h3>
                <table className="table" style={{ width: tableWidth ? `${tableWidth}px` : 'auto' }}>
                <thead>
                  <tr>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor }}>Day</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor }}>Task</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor }}>Task Description</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor }}>Done</th> {/* Add "Done" column header */}
                  </tr>
                  </thead>
                  <tbody>
                    {selectedPlan.data.slice(0).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{ color: selectedPlan.cellTextColor, backgroundColor: selectedPlan.cellBgColor1}}>{cell}</td>
                        ))}
                        <td style={{ color: selectedPlan.cellTextColor, backgroundColor: selectedPlan.cellBgColor1}}>
                          {/* Render a cell for task completion with a checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedPlan.tasks[rowIndex]} // Check if task is completed
                            onChange={() => toggleTask(rowIndex) } // Toggle task completion status
                            style={{ width: '15px', height: '15px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="btn btn-success"
                  onClick={handleExportCSV}
                  style={{ backgroundColor: '#ff9900', borderColor: '#c73c34' }}
                >
                  Export Spreadsheet
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedPlans;