import {Sequelize} from "sequelize";
import dotenv from "dotenv";
import dbConfig from "../config/config.js";
import {UserFactory} from "./user.js";
import {MilkRecordFactory} from "./milkRecord.js";
import {RateFactory} from "./rate.js";

dotenv.config();


const env = process.env.NODE_ENV || "development";

// @ts-ignore
const config = dbConfig[env];

let sequelize;

if (config.use_env_variable) {
    // @ts-ignore
    sequelize = new Sequelize(config.use_env_variable, config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {
    sequelize,
    Sequelize,
    User: UserFactory(sequelize),
    MilkRecord: MilkRecordFactory(sequelize),
    Rate: RateFactory(sequelize)
};

Object.keys(db).forEach(modelName => {
    // @ts-ignore
    if (db[modelName].associations) {
        // @ts-ignore
        db[modelName].associate(db);
    }
})

export default db;
