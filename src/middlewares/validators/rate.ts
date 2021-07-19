import {query, body} from "express-validator";
import Sequelize from "sequelize";
import {isValid} from "date-fns";
import db from "../../models/index.js";
import {pagination} from "./common/pagination.js";
import {sorting} from "./common/sorting.js";
import {destroy} from "./common/destroy.js";
import {read} from "./common/read.js";
import {ValidationRules} from "./ValidationRules.js";
import {rateOverlapsOther, rateOverlapsOnlyItself} from "../../utils/models/rate.js";
import {dateFrom, dateTo} from "./common/filters.js";

const Op = Sequelize.Op;
const {Rate, User} = db;

export const rateFilter = [
    dateFrom,
    dateTo,
    query("startDate")
        .optional({ checkFalsy: true })
        .trim().escape()
        .custom((date: string) => {
            if (isValid(new Date(date))) { return true; }
            throw new Error("Start date must be a valid date");
        })
        .bail()
        .customSanitizer((date: string) => new Date(date)),

    query("endDate")
        .optional({ checkFalsy: true })
        .trim().escape()
        .custom((date: string) => {
            if (isValid(new Date(date))) { return true; }
            throw new Error("End date must be a valid date");
        })
        .bail()
        .customSanitizer((date: string) => new Date(date)),
    ...sorting,
    ...pagination,
];

export const rateRules: ValidationRules = {
    filter: [
        query("setter")
            .optional({ checkFalsy: true })
            .trim().escape()
            .toLowerCase()
            .customSanitizer( async (setter) => {
                const innerCondition = {[Op.like]: `%${setter}%`};
                const rows = await User.findAll({
                    where: {
                        [Op.or]: [
                            {firstName: innerCondition}, {lastName: innerCondition}, {email: innerCondition}
                        ]
                    }
                });
                if (rows.length) {
                    return rows.map( (row) => row.id);
                } else {
                    throw new Error(`User '${setter}' does not exist`);
                }
            }),

        ...rateFilter,
    ],

    create: [
        body("endDate")
            .trim().escape().notEmpty().withMessage("Please enter end date")
            .custom((endDate: string) => {
                if (isValid(new Date(endDate))) { return true; }
                throw new Error("End date must be a valid date");
            })
            .bail()
            .customSanitizer((endDate: string) => new Date(endDate))
            .custom( (endDate, {req}) => {
                if (endDate < req.body.startDate) {
                    throw new Error("End date cannot be before start date");
                }
                return true;
            }),

        body("startDate")
            .trim().escape().notEmpty().withMessage("Please specify start date")
            .custom((startDate: string) => {
                if (isValid(new Date(startDate))) { return true; }
                throw new Error("Start date must be a valid date");
            })
            .bail()
            .customSanitizer((startDate: string) => new Date(startDate))
            .custom( async (startDate, {req}) => {
                if (await rateOverlapsOther(startDate, req.body.endDate)) {
                    throw new Error("Date overlap error. A rate exists covering the entered date")
                }
                return true;
            }),

        body("rate")
            .trim().escape().notEmpty().withMessage("Rate is required")
            .isDecimal({decimal_digits: "1,2"})
            .withMessage("Rate must not exceed 2 decimal places")
            .isFloat({min: 1.00}).withMessage("Rate should be a valid number greater than 1.00")
            .toFloat()
    ],

    read: [
        read(
            "rate",
            async (pk) => await Rate.findByPk(pk)
        )
    ],

    update: [
        body("id")
            .trim().escape().notEmpty().withMessage("Rate id is required")
            .isInt({min: 1}).withMessage("Rate id should be a valid number greater than 0")
            .toInt().bail()
            .custom(async (id) => {
                // check if rate exists in db
                const rate = await Rate.findByPk(id);
                if (rate === null) {
                    throw new Error("Rate does not exist");
                }
                return true;
            }),

        body("endDate")
            .optional({checkFalsy: true})
            .trim().escape()
            .custom((endDate: string) => {
                if (isValid(new Date(endDate))) { return true; }
                throw new Error("End date must be a valid date");
            })
            .bail()
            .customSanitizer((endDate: string) => new Date(endDate))
            .custom( (endDate, { req }) => {
                if (endDate && !req.body?.startDate) {
                    throw new Error("End date must be provided alongside start date");
                }
                return true;
            })
            .custom( (endDate, {req}) => {
                if (endDate < req.body.startDate) {
                    throw new Error("End date cannot be before start date");
                }
                return true;
            }),

        body("startDate")
            .optional({checkFalsy: true})
            .trim().escape()
            .custom((startDate: string) => {
                if (isValid(new Date(startDate))) { return true; }
                throw new Error("Start date must be a valid date");
            })
            .bail()
            .customSanitizer((startDate: string) => new Date(startDate))
            .custom( (startDate, { req }) => {
                if (startDate && !req.body?.endDate) {
                    throw new Error("Start date must be provided alongside end date");
                }
                return true;
            })
            .custom( async (startDate, {req}) => {
                if (!await rateOverlapsOnlyItself(startDate, req.body.endDate, req.body.id)) {
                    throw new Error("Date overlap error. A rate exists covering the entered date")
                }
                return true;
            }),

        body("rate")
            .trim().escape().notEmpty().withMessage("Rate is required")
            .isDecimal({decimal_digits: "1,2"})
            .withMessage("Rate must not exceed 2 decimal places")
            .isFloat({min: 1.00}).withMessage("Rate should be a valid number greater than 1.00")
            .toFloat(),
    ],

    destroy: [
        destroy(
            "rate",
            async (pk) => await Rate.findByPk(pk)
        ),
    ],
};
