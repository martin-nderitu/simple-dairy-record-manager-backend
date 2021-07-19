import db from "../models/index.js";

const milkRecords = [
    {
        "id": 100,
        "amount": "37.00",
        "shift": "morning",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 100,
    },
    {
        "id": 200,
        "amount": "25.00",
        "shift": "afternoon",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 200,
    },
    {
        "id": 300,
        "amount": "20.00",
        "shift": "evening",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 400,
    },
    {
        "id": 400,
        "amount": "25.00",
        "shift": "afternoon",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 100,
    },
    {
        "id": 500,
        "amount": "20.00",
        "shift": "evening",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 200,
    },
    {
        "id": 600,
        "amount": "30.00",
        "shift": "morning",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 200,
    },
    {
        "id": 700,
        "amount": "25.00",
        "shift": "afternoon",
        "farmerId": 200,
        "milkCollectorId": 300,
        "rateId": 200,
    }
];

// @ts-ignore
const seedMilkRecords = async () => await db.MilkRecord.bulkCreate(milkRecords);

export default seedMilkRecords;