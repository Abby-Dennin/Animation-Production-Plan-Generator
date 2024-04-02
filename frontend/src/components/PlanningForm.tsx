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
                        </tr>
                        </thead>
                        <tbody>
                        {values.map((value, index) => {
                            return (
                            <tr key={index}>
                                {value.map((val, i) => {
                                return <td key={i}>{val}</td>;
                                })}
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
};

export default PlanningForm;