import db from "../models/index.js";
import {format, endOfMonth} from "date-fns";

const startOfMonth = (date = new Date()) => {
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) { month = `0${month}`; }
    return `${year}-${month}-01`;
}
const startMonth = startOfMonth();
const endMonth = format(endOfMonth(new Date()), "yyyy-MM-dd").toString();

const rates = [
    {
        "id": 100,
        "startDate": "2021-03-01",
        "endDate": "2021-03-31",
        "rate": "40.00",
        "setterId": 100,
    },
    {
        "id": 200,
        "startDate": "2021-04-01",
        "endDate": "2021-04-30",
        "rate": "35.00",
        "setterId": 100,
    },
    {
        "id": 300,
        "startDate": "2021-05-01",
        "endDate": "2021-05-31",
        "rate": "33.00",
        "setterId": 100,
    },
    {
        "id": 400,
        "startDate": "2021-06-01",
        "endDate": "2021-06-30",
        "rate": "33.00",
        "setterId": 100,
    },
    {
        "id": 500,
        "startDate": startMonth,
        // "startDate": "2021-07-01",
        "endDate": endMonth,
        "rate": "33.00",
        "setterId": 100,
    }
];

// @ts-ignore
const seedRates = async () => await db.Rate.bulkCreate(rates);

export default seedRates;