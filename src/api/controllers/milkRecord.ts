import { Request, Response, NextFunction } from "express";
import log from "../../utils/log.js"
import db from "../../models/index.js";
import {getCurrentRate} from "../../utils/models/rate.js";

const {MilkRecord, Rate, User} = db;


function getIncludeable(role: "admin" | "farmer" | "milk collector" | undefined) {
    const include = [];
    const farmer = {
        model: User,
        as: "farmer",
        attributes: { exclude: ["password"] }
    };
    const milkCollector = {
        model: User,
        as: "milkCollector",
        attributes: { exclude: ["password"] }
    };
    const rate = {
        model: Rate,
        as: "rate"
    }
    const rateFilter = {
        attributes: { exclude: ["setterId", "id"]}
    };

    switch(role) {
        case "admin":
            include.push(farmer, milkCollector, rate);
            break;
        case "milk collector":
            include.push(farmer, {...rate, ...rateFilter });
            break;
        case "farmer":
            include.push({ ...rate, ...rateFilter });
            break;
        default:
            break;
    }

    return include;
}

async function records(req: Request, res: Response, next: NextFunction) {
    try {
        const {filter, pagination} = res.locals;
        const {role} = req.session.user;
        const include = getIncludeable(role);

        const {count, rows} = await MilkRecord.findAndCountAll({
            distinct: true,
            include,
            ...filter,
        });

        if (count) {
            pagination.count = count;
            return res.status(200).json({ records: rows, pagination })
        } else {
            return res.status(400).json({
                error: "No milk records found"
            });
        }
    } catch (error) {
        log("\n\nError getting milk records:", error, "\n\n");
        next({ status: 500, error: "Db error getting milk records" });
    }
}

async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const rate = await getCurrentRate();
        if (rate === null) {
            return res.status(400).json({
                error: "Current rate not found. Set current rate before adding milk record"
            });
        } else {
            const {amount, shift, farmerId} = req.body;
            const newRecord = await MilkRecord.create({
                amount, shift, farmerId,
                rateId: rate.dataValues.id,
                milkCollectorId: req.session.user.id
            });
            if (newRecord.dataValues) {
                return res.status(201).json({
                    message: "Milk record created successfully"
                });
            } else {
                return res.status(400).json({
                    error: "Milk record not created. Please try again"
                });
            }
        }
    } catch (error) {
        log("\n\nError creating milk record:", error, "\n\n");
        next({ status: 500, error: "Db error creating milk record"})
    }
}

async function read(req: Request, res: Response, next: NextFunction) {
    try {
        const {id} = req.params;
        const record = await MilkRecord.findOne({
            include: [
                {
                    model: User,
                    as: "farmer",
                    attributes: {exclude: ["password"]}
                },
                {
                    model: User,
                    as: "milkCollector",
                    attributes: {exclude: ["password"]}
                },
                {
                    model: Rate,
                    as: "rate"
                }
            ],
            where: {id}
        });
        if (record === null) {
            return res.status(400).json({
                error: "Milk record does not exist"
            });
        } else {
            return res.status(200).json({ record });
        }
    } catch (error) {
        log("\n\nError getting milk record:", error, "\n\n");
        next({ status: 500, error: "Db error getting milk record" });
    }
}

async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { id, amount, shift, farmerId } = req.body;
        let updatedRecord = await MilkRecord.update({
            amount, shift, farmerId
        }, { where: { id } });

        if (updatedRecord[0]) {
            return res.status(200).json({
                message: "Milk record updated successfully"
            });
        } else {
            return res.status(400).json({
                error: "Error updating milk record. Please try again"
            });
        }
    } catch (error) {
        log("\n\nError updating milk record:", error);
        next({ status: 500, error: "Db error updating milk record" });
    }
}

async function destroy(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;    // an array of one or more record ids
    try {
        const rowsDeleted = await MilkRecord.destroy({ where: {id} });
        if (rowsDeleted !== id.length) {
            const notDeleted = id.length - rowsDeleted;
            return res.status(400).json({
                error: `${notDeleted} milk record(s) not deleted. Please try again`
            });
        } else {
            return res.status(200).json({
                message: `${id.length} milk record(s) deleted successfully`
            });
        }
    } catch (error) {
        log("Error deleting milk record(s):", error);
        next({ status: 500, error: "Db error deleting milk record(s)"})
    }
}

export {
    records, create, read, update, destroy
}