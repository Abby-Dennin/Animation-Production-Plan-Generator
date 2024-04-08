import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef  } from "react";
import {
    // Backend model route options
    createResponseService, // Default
    createParentalService,
  } from "../services/backend-service";
import Papa from "papaparse";
import { start } from "repl";

interface Props {
    onSavePlan: (plan: any) => void;
    parentHeaderColor: string;
    parentCellColor: string;
    setParentHeaderTextColor: React.Dispatch<React.SetStateAction<string>>;
    setParentCellTextColor: React.Dispatch<React.SetStateAction<string>>;
    setParentHeaderBgColor: React.Dispatch<React.SetStateAction<string>>;
    setParentCellBgColor1: React.Dispatch<React.SetStateAction<string>>;
    setParentCellBgColor2: React.Dispatch<React.SetStateAction<string>>;
}

const currentDate = new Date();

const schema = z.object({
  planName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  moreInfo: z.string(),
});
type FormData = z.infer<typeof schema>;

const formatString = (
    planName: string,
    startDate: string,
    endDate: string,
    moreInfo: string,
) => {
    return (
        "Create an animation production plan in csv format with the headers: week, day, task, task description, for a project called: " +
        planName + 
        ", assign dates for each task assuming the project is starting on " + startDate + 
        " and is ending on " + endDate + "." +
        "week must be output as numbers. days must be output as dates in mm/dd format" + 
        " and a day can have multiple tasks. Keep " + moreInfo + "in mind"
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

    const [headerTextColor, setHeaderTextColor] = useState("#ffffff");

    const [cellTextColor, setCellTextColor] = useState("#000000");

    const [cellBgColor1, setCellBgColor1] = useState("#ffffff");

    const [cellBgColor2, setCellBgColor2] = useState("#adadad");

    const [headerBgColor, setHeaderBgColor] = useState("#000000");

    const bottomRef = useRef<HTMLDivElement>(null);

    const [planName, setPlanName] = useState(""); // State variable to store the plan name

    const onSubmit = (data: FieldValues) => {
        console.log(data);
        setIsLoading(true);

        const {request, cancel } = createResponseService().post([
            {
                role: "user",
                content: formatString(data.planName, data.startDate, data.endDate, data.moreInfo),
            },
        ]);

        const plan = {
            planName: data.planName,
            daysLeft: data.daysLeft,
            headerTextColor,
            cellTextColor,
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
          headerTextColor: headerTextColor,
          cellTextColor: cellTextColor,
          headerBgColor: headerBgColor,
          cellBgColor1: cellBgColor1,
          cellBgColor2: cellBgColor2,
          tasks: emptyTasksArray,
        };
        onSavePlan(newPlan); // Call the onSavePlan prop to save the plan
        setFormSubmitted(false);
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      };

      const renderPreviewTable = () => {
        // Example default values
        const defaultTableRows = ["week", "day", "task", "task description","done"];
        const defaultValues = [
          ["1", "04/07", "Task 1", "Description 1"],
          ["2", "04/13", "Task 2", "Description 2"],
        ];
      
        return (
          <div className="mw-45 p-2 col">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  {defaultTableRows.map((row, index) => (
                    <th key={index} style={{ color: headerTextColor, backgroundColor: headerBgColor }}>
                      {row}
                    </th>
                  ))}
                  <th style={{ color: headerTextColor, backgroundColor: headerBgColor }}>
                    {formSubmitted && <th>Done</th>}
                  </th> {/* Add the "Done" column header */}
                </tr>
              </thead>
              <tbody>
                {defaultValues.map((row, index) => (
                  <tr key={index}>
                    {row.map((val, i) => (
                      <td key={i} style={{ color: cellTextColor, backgroundColor: cellBgColor1 }}>
                        {val}
                      </td>
                    ))}
                    <td style={{ color: cellTextColor, backgroundColor: cellBgColor1 }}>
                      <input type="checkbox" checked={false} style={{ width: '15px', height: '15px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      };
    
    const getCellBgColor = (rowValues:string[]) => {
        const week = parseInt(rowValues[0], 10); 

        return (week % 2 === 0) ? cellBgColor2 : cellBgColor1;
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

                            <label htmlFor="startDate" className="form-label">
                                What is your project start date?
                            </label>
                            <input
                                {...register("startDate")}
                                id="startDate"
                                type="text"
                                className="form-control"
                            />

                            <label htmlFor="endDate" className="form-label">
                                What is your project end date?
                            </label>
                            <input
                                {...register("endDate")}
                                id="endDate"
                                type="text"
                                className="form-control"
                            />

                            <label htmlFor="moreInfo" className="form-label">
                                More information about your project:
                            </label>
                            <input
                                {...register("moreInfo")}
                                id="moreInfo"
                                type="text"
                                className="form-control"
                            />
                        </div>
                        <button className="btn btn-primary mb-3" style={{ backgroundColor: '#c73c34', borderColor: '#ff9900' }} >Generate!</button>
                    </form>
                </div>
                <div className="mw-45 p-2 col">
                <div>
                    <h2 style={{ fontFamily: 'Arial Black', fontWeight: 'bold', color: '#333' }}>Preview</h2>
                </div>
                    <div>
                    <input
                        type="color"
                        id="headerColor"
                        value={headerTextColor}
                        onChange={(e) => {
                            setHeaderTextColor(e.target.value);
                            setParentHeaderTextColor(e.target.value);
                        }}
                        style={{width: "40px", height: "40px", padding: '2px' }}
                    />
                    <label htmlFor="headerColor" className="form-label" style={{padding: '4px'}}>
                        Select text color for header
                    </label>
                    </div>

                    <div>
                    <input
                        type="color"
                        id="headerBgColor"
                        value={headerBgColor}
                        onChange={(e) => {
                            setHeaderBgColor(e.target.value);
                            setParentHeaderBgColor(e.target.value);
                        }}
                        style={{width: "40px", height: "40px", padding: '2px' }}
                    />
                    <label htmlFor="headerBgColor" className="form-label" style={{padding: '4px'}}>
                        Select background color for header
                    </label>
                    </div>
                    
                    <div>
                    <input
                        type="color"
                        id="cellColor"
                        value={cellTextColor}
                        onChange={(e) => {
                            setCellTextColor(e.target.value)
                            setParentCellColor(e.target.value);
                        }}
                        style={{width: "40px", height: "40px", padding: '2px' }}
                    />
                    <label htmlFor="cellColor" className="form-label" style={{padding: '4px'}}>
                        Select text color for cells
                    </label>
                    </div>
                    
                    <div>
                    <input
                        type="color"
                        id="cellBgColor1"
                        value={cellBgColor1}
                        onChange={(e) => {
                            setCellBgColor1(e.target.value);
                            setParentCellBgColor1(e.target.value);
                        }}
                        style={{width: "40px", height: "40px", padding: '2px' }}
                    />
                    <input
                        type="color"
                        id="cellBgColor2"
                        value={cellBgColor2}
                        onChange={(e) => {
                            setCellBgColor2(e.target.value);
                            setParentCellBgColor2(e.target.value);
                        }}
                        style={{width: "40px", height: "40px", padding: '2px' }}
                    />
                    <label htmlFor="cellBgColor" className="form-label" style={{padding: '4px'}}>
                        Select background color for cells
                    </label>
                    </div>

                    {!formSubmitted && (
                        <div className="mw-45 p-2 col">
                        {renderPreviewTable()}
                        </div>
                    )}

                    <div className="mw-45 p-2 col">
                        {isLoading && <div className="spinner-border"></div>}
                        {formSubmitted && (
                        <table>
                            <thead>
                            <tr>
                                {tableRows.map((row, index) => (
                                <th
                                    key={index}
                                    style={{ color: headerTextColor, backgroundColor: headerBgColor }}
                                >
                                    {row}
                                </th>
                                ))}
            
                                <th style={{ color: headerTextColor, backgroundColor: headerBgColor }}>
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
                                        <td key={i} style={{ color: cellTextColor, backgroundColor: getCellBgColor(row) }}>
                                        {val}
                                        </td>
                                    ))}
                                    <td style={{ color: cellTextColor, backgroundColor: getCellBgColor(row) }}>
                                        <input
                                            type="checkbox"
                                            checked={false}
                                            style={{ width: '15px', height: '15px' }}
                                        />
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>)}
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