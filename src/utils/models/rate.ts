import Sequelize from "sequelize";
import db from "../../models/index.js";

const {Rate} = db;
const Op = Sequelize.Op;


async function getCurrentRate () {
    const today = new Date().toJSON().substring(0,10);
    const condition = {
        [Op.and]: [
            {start_date: { [Op.lte]: today }}, {end_date: { [Op.gte]: today }}
        ]
    };
    return await Rate.findOne({ where: condition });
}

async function rateOverlapsOther(startDate: Date, endDate: Date) {
    const condition = {
        [Op.and]: [
            {start_date: { [Op.lte]: endDate }}, {end_date: { [Op.gte]: startDate}}
        ]
    };
    let { count } = await Rate.findAndCountAll({ where: condition });
    return count > 0;
}

async function rateOverlapsOnlyItself(startDate: Date, endDate: Date, rateId: number) {
    const condition = {
        [Op.and]: [
            {start_date: { [Op.lte]: endDate }}, {end_date: { [Op.gte]: startDate}}
        ]
    };
    let { count, rows } = await Rate.findAndCountAll({ where: condition });
    if (count) {
        for (const row of rows) {
            if (row.dataValues.id !== rateId) {
                return false;
            }
        }
    }
    return true;
}

export {
    getCurrentRate, rateOverlapsOther, rateOverlapsOnlyItself
}