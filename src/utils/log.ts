import dotenv from "dotenv";

dotenv.config();

export default function log(...args: any) {
    if (process.env.NODE_ENV === "development") {
        console.log(...args);
    }
}