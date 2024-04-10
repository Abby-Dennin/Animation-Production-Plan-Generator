// SavedPlans.tsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import "./style.css"; // Import the CSS file

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
  const [progress, setProgress] = useState(0);

    useEffect(() => {
        const savedPlansData = localStorage.getItem("savedPlans");
        if (savedPlansData) {
        const parsedSavedPlans: SavedPlan[] = JSON.parse(savedPlansData);
        // sets the selected plan
        setSelectedPlan(parsedSavedPlans.find(plan => plan.planName === selectedPlan?.planName) || null);
        }
    }, []);

    useEffect(() => {
        if (selectedPlan) {
        const totalColumnWidth = 700; // Assuming each column has a width of 100px
        setTableWidth(totalColumnWidth);
        }
    }, [selectedPlan]);

    useEffect(() => {
      // calculate percentage of completed tasks to update progress bar
      if (selectedPlan) {
        const completedTasks = selectedPlan.tasks.filter((task) => task).length;
        const totalTasks = selectedPlan.tasks.length;
        const percentage = (completedTasks / totalTasks) * 100;
        setProgress(percentage);
      }
    }, [selectedPlan]);

    // function to toggle the completion status of a task
    const toggleTask = (index: number) => {
        const planToUpdate = savedPlans.find(plan => plan.planName === selectedPlan.planName);
        const updatedTasks = [...selectedPlan.tasks];
        updatedTasks[index] = !updatedTasks[index];
        planToUpdate.tasks = updatedTasks;
        setSelectedPlan({ ...selectedPlan, tasks: updatedTasks });
        localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
      };

  // handles click of a saved plan - sets selected plan
  const handleButtonClick = (plan: SavedPlan) => {
    if (selectedPlan && selectedPlan.planName === plan.planName) {
      setShowDetails(!showDetails); // Toggle showDetails
    } else {
      setSelectedPlan(plan);
      setShowDetails(true); // Show details if a different plan is selected
    }
  };

  // function to currently selected plan as csv
  const handleExportCSV = () => {
    const csvRows = [];
    // header rows
    const headerRow = [
        "Week",
        "Day",
        "Task",
        "Task Description",
        "Done"
    ].map(cell => `"${cell}"`).join(",");
    csvRows.push(headerRow);

    // body rows
    selectedPlan.data.forEach((row, rowIndex) => {
        const csvRow = row.map(cell => `"${cell}"`).join(",");
        const taskStatus = selectedPlan.tasks[rowIndex] ? "Yes" : "No"; 
        const csvRowWithStatus = `${csvRow},"${taskStatus}"`;
        csvRows.push(csvRowWithStatus);
    });

    const csvContent = csvRows.join("\n");

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

// function to delete plan
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

  // gets alternate week background color
  const getCellBgColor2 = (rowValues:string[]) => {
    console.log("cellBgColor1: ", cellBgColor1);
    console.log("cellBgColor2: ", cellBgColor2);
    const week = parseInt(rowValues[0], 10); 
    console.log("week: ", week);
    return (week % 2 === 0) ? selectedPlan.cellBgColor2 : selectedPlan.cellBgColor1;
  };

  // gets whether every task of a plan is completed
  const getCompleted = (plan: SavedPlan) => {
    return plan.tasks.every(task => task);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between'}}>
      <div style={{ flex: '1', padding: '20px' }}>
        {/* render list of saved plans*/}
        <h2 style={{color: '#ffffff', fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 'bold', }}>My Plans</h2>
              <ul  style={{color: '#ffffff'}}>
                {savedPlans.map((plan, index) => (
                  <li key={index}>
                    {/* renders plan title as a button */}
                    <button className="btn btn-primary mb-3" onClick={() => handleButtonClick(plan)} style={{fontFamily: "'Trebuchet MS', sans-serif", fontSize: '20px', backgroundColor: '#e19d44', borderColor: '#e19d44' }}>
                      {plan.planName}
                    </button>
                    {/* delete plan button */}
                    <button
                      className="btn btn-danger mb-3 ms-2"
                      onClick={() => deletePlan(index)}
                      style={{backgroundColor: 'transparent',border: '1px solid white'}}
                    > 
                       <FontAwesomeIcon icon={faTrashCan}  style={{ color: '#ffffff'}}/>
                    </button>

                    {/* icon to show whether all tasks in plan completed*/}
                    {getCompleted(plan) && (
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'white', padding:'10px' }} />
                    )}
                  </li>
                ))}
              </ul>
      </div>
      <div style={{padding: '20px', color: '#ffffff'}}>
        {savedPlans.length === 0 ? (
          {/* if no plans currently saved */}
          <p style={{fontFamily: "'Trebuchet MS', sans-serif", fontSize: '20px'}}>...no saved plans available.</p>
        ) : (
          <>
            {/* show selected plan if a saved plan has been selected */}
            {selectedPlan && showDetails && (
              <div >
                {/* render progress bar */}
                <div style={{fontFamily: "'Trebuchet MS', sans-serif", fontSize: '19px', paddingBottom:'40px', paddingTop:'40px'}}>
                  Your Progress:
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%`, backgroundColor:'#e19d44'  }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    </div>
                  </div>
                </div>
                
                <h4 style={{color: '#ffffff', fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 'bold'}}>{selectedPlan.planName}</h4>
                
                {/* render production plan in table */}
                <table className="table" style={{ width: tableWidth ? `${tableWidth}px` : 'auto', borderRadius: '15px', overflow: 'hidden'}}>
                <thead style={{fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 'bold', fontSize: '18px'}}>
                  <tr>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor,padding: '10px'}}>Week</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor,padding: '10px'}}>Day</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor,padding: '10px'}}>Task</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor,padding: '10px'}}>Task Description</th>
                      <th style={{ color: selectedPlan.headerTextColor, backgroundColor: selectedPlan.headerBgColor,padding: '10px'}}>Done</th> {/* Add "Done" column header */}
                  </tr>
                  </thead>
                  <tbody style={{fontFamily: "'Trebuchet MS', sans-serif", fontSize: '18px', padding: '20px'}}>
                    {selectedPlan.data.slice(0).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{ color: selectedPlan.cellTextColor, backgroundColor: getCellBgColor2(row)}}>{cell}</td>
                        ))}
                        <td style={{ color: selectedPlan.cellTextColor, backgroundColor: getCellBgColor2(row)}}>
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

                {/* button to export spreadsheet */}
                <button
                  className="btn btn-success"
                  onClick={handleExportCSV}
                  style={{fontFamily: "'Trebuchet MS', sans-serif", fontSize: '20px', backgroundColor: '#e19d44', borderColor: '#e19d44'}}
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