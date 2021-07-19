import seedUsers from "./user.js";
import seedRates from "./rate.js";
import seedMilkRecords from "./milkRecord.js";
import db from "../models/index.js";
import log from "../utils/log.js";

try {
    // insert test data in db
    if (process.env.NODE_ENV === "test") {
        await db.sequelize.sync({force: true});

        const users = await seedUsers();
        if (users.length) {
            const rates = await seedRates();
            if (rates.length) {
                await seedMilkRecords();
            }
        }
    }
} catch (error) {
    log("\n\nError inserting test data ", error, "\n\n");
}