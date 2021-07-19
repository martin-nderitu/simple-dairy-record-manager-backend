import { Request, Response, NextFunction } from "express";
import log from "../../utils/log.js"
import db from "../../models/index.js";
import isEmpty from "../../utils/isEmpty.js";

const {Rate, User} = db;

function conditionalOptions(role: "admin" | "farmer" | "milk collector" | undefined) {
    let include = {};
    let rateFilter = {};

    if (role === "admin") {
        include = {
            model: User,
            as: "setter",
            attributes: { exclude: ["password"] }
        };
    } else {
        rateFilter = {
            attributes: { exclude: ["setterId", "id"]}
        };
    }

    let options: any = {};
    if (!isEmpty(include)) { options.include = include }
    if (!isEmpty(rateFilter)) { options = {...options, ...rateFilter }}

    return options;
}

async function rates(req: Request, res: Response, next: NextFunction) {
    try {
        const {filter, pagination} = res.locals;
        const {role} = req.session.user;
        const options = conditionalOptions(role);

        const {count, rows} = await Rate.findAndCountAll({
            distinct: true,
            ...filter,
            ...options,
        });

        if (count) {
            pagination.count = count;
            return res.status(200).json({ rates: rows, pagination })
        } else {
            return res.status(400).json({
                error: "No rates found"
            });
        }
    } catch (error) {
        log("\n\nError getting rates:", error, "\n\n");
        next({ status: 500, error: "Db error getting rates" });
    }
}

async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const { startDate, endDate, rate } = req.body;
        const newRate = await Rate.create({
            startDate, endDate, rate,
            setterId: req.session.user.id
        });
        if (newRate.dataValues) {
            return res.status(201).json({
                message: "Rate created successfully"
            });
        } else {
            return res.status(400).json({
                error: "Rate not created. Please try again"
            });
        }
    } catch (error) {
        log("\n\nError creating rate:", error, "\n\n");
        next({ status: 500, error: "Db error creating rate"})
    }
}

async function read(req: Request, res: Response, next: NextFunction) {
    try {
        const rate = await Rate.findByPk(req.params.id);
        if (rate === null) {
            return res.status(400).json({
                error: "Rate does not exist"
            });
        } else {
            return res.status(200).json({ rate });
        }
    } catch (error) {
        log("\n\nError getting rate:", error, "\n\n");
        next({ status: 500, error: "Db error getting rate" });
    }
}

async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { id, startDate, endDate, rate } = req.body;
        let updatedRate = await Rate.update({
            startDate, endDate, rate
        }, { where: { id } });

        if (updatedRate[0]) {
            return res.status(200).json({
                message: "Rate updated successfully"
            });
        } else {
            return res.status(400).json({
                error: "Error updating rate. Please try again"
            });
        }
    } catch (error) {
        log("\n\nError updating rate:", error);
        next({ status: 500, error: "Db error updating rate" });
    }
}

async function destroy(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;    // an array of one or more rate ids
    try {
        const rowsDeleted = await Rate.destroy({ where: {id} });
        if (rowsDeleted !== id.length) {
            const notDeleted = id.length - rowsDeleted;
            return res.status(400).json({
                error: `${notDeleted} rate(s) not deleted. Please try again`
            });
        } else {
            return res.status(200).json({
                message: `${id.length} rate(s) deleted successfully`
            });
        }
    } catch (error) {
        log("Error deleting rate(s):", error);
        next({ status: 500, error: "Db error deleting rate(s)"})
    }
}

export {
    rates, create, read, update, destroy
}