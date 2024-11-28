import {Document, Model} from "mongoose";

interface MonthData {
    month: string;
    count: number;
}

// generate last 12 months analytics
export async function generateLast12MonthsData<T extends Document> (
    model: Model<T>
): Promise<{last12Months: MonthData[]}>{
    // get last 12 months
    const last12Months: MonthData[] = [];
    const currentDate = new Date();

    
    currentDate.setDate(currentDate.getDate() + 1);

    // it will go back (28 * 12) days ago (reverse because we need 12 months data)
    for(let i = 11; i != 0; i--){

        // The end of the 28-day period. It's calculated by subtracting i * 28 days from the current date.
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28);
        
        //  The start of the 28-day period, which is 28 days before the endDate.
        const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);

        // Converts endDate into a human-readable format such as "28 Feb 2024
        const monthYear = endDate.toLocaleString('default', {day:"numeric", month: "short", year:"numeric"});

        // $gte: Includes documents created on or after startDate.
        // $lt: Excludes documents created on or after endDate
        const count = await model.countDocuments({
            createdAt:{
                $gte: startDate,
                $lt: endDate,
            }
        });
        last12Months.push({month: monthYear, count});
    }
    return { last12Months };
}