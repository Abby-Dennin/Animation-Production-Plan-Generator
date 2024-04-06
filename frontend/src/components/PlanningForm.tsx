import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  // Backend model route options
  createResponseService, // Default
  createParentalService,
} from "../services/backend-service";

import Papa from "papaparse";

const schema = z.object({
  planName: z.string(),
  daysLeft: z.string(),
});
type FormData = z.infer<typeof schema>;

const formatString = (
    planName: string,
    daysLeft: string
) => {
    return (
        "Create an animation production plan in csv format with the headers: task, task description, start date, end date for a project called: " +
        planName + 
        ", assign dates for each task assuming it is due in: " +
        daysLeft +
        " days."
    );
}

const PlanningForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormData>();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [queryResponse, setQueryResponse] = useState("");
    
    // State to store parsed data
    const [parsedData, setParsedData] = useState([]);

    //State to store table Column name
    const [tableRows, setTableRows] = useState([]);
    
    //State to store the values
    const [values, setValues] = useState([]);

    // default color for header
    const [headerColor, setHeaderColor] = useState("#000000"); 

    // default color for other cell colors
    const [cellColor, setCellColor] = useState("#ffffff"); 

    const onSubmit = (data: FieldValues) => {
        console.log(data);
        setIsLoading(true);

        const {request, cancel } = createResponseService().post([
            {
                role: "user",
                content: formatString(data.planName, data.daysLeft),
            },
        ]);

        request
            .then((res) => {
                setQueryResponse(res.data);
                console.log(res.data);
                Papa.parse(res.data, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                      const rowsArray = [];
                      const valuesArray = [];
              
                      // Iterating data to get column name and their values
                      results.data.map((d) => {
                        rowsArray.push(Object.keys(d));
                        valuesArray.push(Object.values(d));
                      });
              
                      // Parsed Data Response in array format
                      setParsedData(results.data);
              
                      // Filtered Column Names
                      setTableRows(rowsArray[0]);
              
                      // Filtered Values
                      setValues(valuesArray);
                    },
                  });
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    const handleExportCSV = () => {
        const csvRows = [];
        // Add header row
        const headerRow = [...tableRows, "Done"].map(row => {
            return `"${row}"`; // Wrap each cell in double quotes
        }).join(",");
        csvRows.push(headerRow);
    
        // Add data rows
        values.forEach(row => {
            const csvRow = [...row, "No"].map((cell, index) => {
                if (index === 0) {
                    // First cell, apply header color
                    return `"${cell}"`;
                } else if (index === row.length) {
                    // Last cell, add "Yes/No" for "Done" column
                    return `"${cell}"`;
                } else {
                    // Other cells, apply cell color
                    return `"${cell}"`;
                }
            }).join(",");
            csvRows.push(csvRow);
        });
    
        // Combine rows into CSV content
        const csvContent = csvRows.join("\n");
    
        // Download CSV file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "production_plan.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Your browser does not support downloading files.");
        }
    };

    return (
        <div className="container">
        <div className="row">  
            <div className="mw-45 col p-2 ">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && <p className="text-danger">{error}</p>}
                    <p>Generate a Production Plan</p>
                    <div className="mb-3">
                        <label htmlFor="planName" className="form-label">
                            What is the name of your production?
                        </label>
                        <input
                            {...register("planName")}
                            id="planName"
                            type="text"
                            className="form-control"
                        />

                        <label htmlFor="daysLeft" className="form-label">
                            How many days do you have to complete this project?
                        </label>
                        <input
                            {...register("daysLeft")}
                            id="daysLeft"
                            type="text"
                            className="form-control"
                        />
                    </div>
                    <button className="btn btn-primary mb-3">Generate Plan</button>
                </form>
            </div>
            <div className="mw-45 p-2 col">
                {isLoading && <div className="spinner-border"></div>}
                <table>
                    <thead>
                        <tr>
                            {tableRows.map((rows, index) => {
                            return <th key={index}>{rows}</th>;
                            })}
                            <th>Done</th>
                        </tr>
                        </thead>
                        <tbody>
                        {values.map((value, index) => {
                            return (
                            <tr key={index}>
                                {value.map((val, i) => {
                                return <td key={i}>{val}</td>;
                                })}
                                <td> {/* Render a cell for "Done" */}
                                    <select>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div>
                <button className="btn btn-success mt-3" onClick={handleExportCSV}>
                    Export Table
                </button>
                </div>

                <div><h2>Preview</h2></div>

                <label htmlFor="headerColor" className="form-label">
                    Select color for header:
                </label>
                <input
                    type="color"
                    id="headerColor"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                />
                <label htmlFor="cellColor" className="form-label">
                    Select color for cells:
                </label>
                <input
                    type="color"
                    id="cellColor"
                    value={cellColor}
                    onChange={(e) => setCellColor(e.target.value)}
                />

                <div className="mw-45 p-2 col">
                    {isLoading && <div className="spinner-border"></div>}
                    <table>
                        <thead>
                        <tr>
                            {tableRows.map((row, index) => (
                            <th
                                key={index}
                                style={{ color: headerColor, backgroundColor: cellColor }}
                            >
                                {row}
                            </th>
                            ))}
                        <th style={{ color: headerColor, backgroundColor: cellColor }}>Done</th> {/* Add the "Done" column header */}
                        </tr>
                        </thead>
                        <tbody>
                            {values.map((row, index) => (
                                <tr key={index}>
                                {row.map((val, i) => (
                                    <td key={i} style={{ color: cellColor}}>
                                    {val}
                                    </td>
                                ))}
                                <td style={{ color: cellColor }}>
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

            </div>
        </div>
        </div>
    );
};

export default PlanningForm;