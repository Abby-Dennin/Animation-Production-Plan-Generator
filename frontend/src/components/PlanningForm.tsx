import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
    // Backend model route options
    createResponseService, // Default
    createParentalService,
  } from "../services/backend-service";
import Papa from "papaparse";

interface Props {
    onSavePlan: (plan: any) => void;
    parentHeaderColor: string;
    parentCellColor: string;
    setParentHeaderColor: React.Dispatch<React.SetStateAction<string>>;
    setParentCellColor: React.Dispatch<React.SetStateAction<string>>;
}

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

const PlanningForm: React.FC<Props> = ({ onSavePlan, parentHeaderColor, parentCellColor, setParentHeaderColor, setParentCellColor }) => {
    
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

    // has form been submitted (default is false when application launched)
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [headerColor, setHeaderColor] = useState("#ffffff");

    const [cellColor, setCellColor] = useState("#000000");

    const [savedPlans, setSavedPlans] = useState([]);

    const [planName, setPlanName] = useState(""); // State variable to store the plan name

    const onSubmit = (data: FieldValues) => {
        console.log(data);
        setIsLoading(true);

        const {request, cancel } = createResponseService().post([
            {
                role: "user",
                content: formatString(data.planName, data.daysLeft),
            },
        ]);

        const plan = {
            planName: data.planName,
            daysLeft: data.daysLeft,
            headerColor,
            cellColor,
          };

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
                setFormSubmitted(true);
                setPlanName(data.planName);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    const handleSavePlan = () => {
        // Add the current plan to the list of saved plans
        const emptyTasksArray: boolean[] = Array(values.length).fill(false);
        const newPlan = {
          planName: planName,
          data: values,
          headerColor: headerColor,
          cellColor: cellColor,
          tasks: emptyTasksArray,
        };
        onSavePlan(newPlan); // Call the onSavePlan prop to save the plan
      };

    return (
        <div className="container">
            <div className="row">  
                <div className="mw-45 col p-2 ">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {error && <p className="text-danger">{error}</p>}
                        <h3 style={{ color: '#c73c34' }}>Send us your project goals, and we'll do the rest! 😎</h3>
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
                        <button className="btn btn-primary mb-3" style={{ backgroundColor: '#c73c34', borderColor: '#ff9900' }} >Generate!</button>
                    </form>
                </div>
                <div className="mw-45 p-2 col">
                    <div><h2>Preview</h2></div>

                    <label htmlFor="headerColor" className="form-label">
                        Select color for header:
                    </label>
                    <input
                        type="color"
                        id="headerColor"
                        value={headerColor}
                        onChange={(e) => {
                            setHeaderColor(e.target.value);
                            setParentHeaderColor(e.target.value);
                        }}
                    />
                    <label htmlFor="cellColor" className="form-label">
                        Select color for cells:
                    </label>
                    <input
                        type="color"
                        id="cellColor"
                        value={cellColor}
                        onChange={(e) => {
                            setCellColor(e.target.value)
                            setParentCellColor(e.target.value);
                        }}
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
            
                                <th style={{ color: headerColor, backgroundColor: cellColor }}>
                                    {formSubmitted && (
                                        <th>Done</th>
                                    )}
                                </th> {/* Add the "Done" column header */}
                            </tr>
                            </thead>
                            <tbody>
                                {values.map((row, index) => (
                                    <tr key={index}>
                                    {row.map((val, i) => (
                                        <td key={i} style={{ color: cellColor }}>
                                        {val}
                                        </td>
                                    ))}
                                    <td style={{ color: cellColor }}>
                                        <input
                                            type="checkbox"
                                            checked={false}
                                        />
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {formSubmitted && (
                    <div className="mw-45 p-2 col">
                        {/* Render the table and save plan button */}
                        <button className="btn btn-primary" onClick={handleSavePlan} style={{ backgroundColor: '#c73c34', borderColor: '#ff9900' }}>
                        SAVE PLAN
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanningForm;
