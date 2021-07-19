import Sequelize from "sequelize";
import { Request, Response, NextFunction } from "express";
import isNumeric from "../utils/isNumeric.js";

const Op = Sequelize.Op;

interface Pagination {
    [k: string]: number;
    currentPage: number;
    limit: number;
    offset: number;
}

interface Filter {
    where: any;
    order: any;
    offset?: number;
    limit?: number;
}

function getPagination(page: number | undefined, limit: number | "all" | undefined): Pagination | undefined {
    if (limit === "all") { return; }

    if (page) {
        if (page < 1) { page = 1; }
    } else { page = 1; }

    if (limit) {
        if (limit > 500) { limit = 500; }
        if (limit < 5) { limit = 5; }
    } else { limit = 5; }

    let offset = page > 1 ? (page - 1) * limit : 0;

    return { currentPage: page, limit, offset };
}

function getFilter(condition: any, sort: any, pagination: Pagination | undefined) {
    const order = sort || [["id", "desc"]];   // default ordering is "id desc"
    const filter: Filter = {
        where: condition,
        order,
    }
    if (pagination) {
        const {offset, limit} = pagination;
        filter.offset = offset;
        filter.limit = limit;
    }
    return filter;
}

function processFilters(req: Request, res: Response, next: NextFunction, conditions: any[]) {
    const {sort, page, limit, from, to} = req.query; // common query params
    // @ts-ignore
    const pagination = getPagination(page, limit);
    let condition = {};

    if (from) {
        conditions.push({ created_at: { [Op.gte]: from } });
    }

    if (to) {
        conditions.push({ created_at: { [Op.lte]: to } });
    }

    if (conditions.length) {
        condition = { [Op.and]: [conditions] };
    }

    res.locals.filter = getFilter(condition, sort, pagination);
    res.locals.pagination = pagination || {};
    next();
}

function user(req: Request, res: Response, next: NextFunction) {
    const {idNameOrEmail, role, active} = req.query;
    const conditions = [];

    if (idNameOrEmail) {
        // @ts-ignore
        if (isNumeric(idNameOrEmail)) {
            // @ts-ignore
            conditions.push({id: parseInt(idNameOrEmail)});
        } else {
            const innerCondition = {[Op.iLike]: `%${idNameOrEmail}%`};
            conditions.push({
                [Op.or]: [
                    {email: innerCondition}, {first_name: innerCondition}, {last_name: innerCondition}
                ]
            });
        }
    }

    if (role) { conditions.push({ role }); }
    // @ts-ignore
    if (active === "true" || active === "false") { conditions.push({ active }); }
    processFilters(req, res, next, conditions);
}

function rate(req: Request, res: Response, next: NextFunction) {
    const {setter, startDate, endDate} = req.query;
    const conditions = [];
    if (startDate) {
        conditions.push({
            start_date: { [Op.gte]: startDate }
        });
    }

    if (endDate) {
        conditions.push({
            end_date: { [Op.lte]: endDate }
        });
    }
    if (req.session.user.role === "admin" && setter) { conditions.push({ setter_id: setter }); }
    processFilters(req, res, next, conditions);
}

function record(req: Request, res: Response, next: NextFunction) {
    const {farmer, milkCollector, shift} = req.query;
    const conditions = [];
    if (farmer) { conditions.push({ farmer_id: farmer }); }
    if (milkCollector) { conditions.push({ milk_collector_id: milkCollector }); }
    if (shift) { conditions.push({ shift }); }
    processFilters(req, res, next, conditions);
}

function farmerRecord(req: Request, res: Response, next: NextFunction) {
    const {shift} = req.query;
    const conditions: any[] = [{ farmer_id: req.session.user.id },];
    if (shift) { conditions.push({ shift }); }
    processFilters(req, res, next, conditions);
}

function milkCollectorRecord(req: Request, res: Response, next: NextFunction) {
    const {farmerId, shift} = req.query;
    const conditions: any[] = [{ milk_collector_id: req.session.user.id }];
    if (farmerId) { conditions.push({ [Op.or]: [{ farmer_id: farmerId }] }); }
    if (shift) { conditions.push({ shift }); }
    processFilters(req, res, next, conditions);
}

export default {
    user, record, rate, farmerRecord, milkCollectorRecord
}