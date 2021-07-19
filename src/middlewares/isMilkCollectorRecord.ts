import db from "../models/index.js";
import {Request, Response, NextFunction} from "express";

const {MilkRecord} = db;

export async function isMilkCollectorRecord(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id || req.body.id;
    const record = await MilkRecord.findOne({ where: {id} });
    if (record === null) {
        return res.status(400).json({
            error: "Record does not exist"
        });
    } else {
        if (record.milkCollectorId === req.session.user.id) {
            next();
        } else {
            return res.status(400).json({
                error: "You are not authorized to access this record"
            });
        }
    }
}
