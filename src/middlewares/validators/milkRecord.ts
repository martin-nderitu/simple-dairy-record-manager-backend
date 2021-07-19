import {query, body} from "express-validator";
import Sequelize from "sequelize";
import db from "../../models/index.js";
import {pagination} from "./common/pagination.js";
import {sorting} from "./common/sorting.js";
import {destroy} from "./common/destroy.js";
import {ValidationRules} from "./ValidationRules.js";
import {read} from "./common/read.js";
import {dateFrom, dateTo} from "./common/filters.js";

const Op = Sequelize.Op;
const {MilkRecord, User} = db;

export const recordFilter = [
    query("shift")
        .optional({ checkFalsy: true })
        .trim().escape().isAlpha().withMessage("Shift must be alphabetic")
        .toLowerCase()
        .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift"),

    dateFrom,
    dateTo,
    ...sorting,
    ...pagination,
];

export const recordRules: ValidationRules = {
    filter: [
        // search records by farmer name or email
        query("farmer")
            .optional({ checkFalsy: true })
            .trim().escape().toLowerCase()
            .customSanitizer( async (farmer) => {
                const innerCondition = {[Op.like]: `%${farmer}%`};
                const condition = {
                    [Op.and]: [
                        {role: "farmer"},
                        {
                            [Op.or]: [
                                {firstName: innerCondition}, {lastName: innerCondition}, {email: innerCondition}
                            ]
                        }
                    ]
                };
                const rows = await User.findAll({ where: condition });
                if (rows.length) {
                    return rows.map( (row) => row.id);
                } else {
                    throw new Error(`Farmer '${farmer}' does not exist`);
                }
            }),

        // search records by milk collector name or email
        query("milkCollector")
            .optional({ checkFalsy: true })
            .trim().escape().toLowerCase()
            .customSanitizer( async (milkCollector, {req}) => {
                if (req.session.user && req.session.user.role === "milk collector") {
                    return req.session.user.id;
                }

                const innerCondition = {[Op.like]: `%${milkCollector}%`};
                const condition = {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                {role: "milk collector" }, { role: "admin" } // admins can also add milk records
                            ]
                        },
                        {
                            [Op.or]: [
                                {firstName: innerCondition}, {lastName: innerCondition}, {email: innerCondition}
                            ]
                        }
                    ]
                };
                const rows = await User.findAll({ where: condition });
                if (rows.length) {
                    return rows.map( (row) => row.id);
                } else {
                    throw new Error(`Milk collector '${milkCollector}' does not exist`);
                }
            }),

        ...recordFilter,
    ],

    create: [
        body("farmerId")
            .trim().escape().notEmpty().withMessage("Farmer id is required")
            .isInt().withMessage("Farmer id should be an integer")
            .toInt()
            .custom( async (farmerId) => {
                const user = await User.findByPk(farmerId);
                if (user === null) {
                    return Promise.reject("Invalid farmer id. User doesn't exist");
                } else if (user.dataValues.role !== "farmer") {
                    return Promise.reject("Invalid farmer id. User not a farmer");
                }
                return true;
            }),

        body("amount")
            .trim().escape().notEmpty().withMessage("Amount of milk is required")
            .isDecimal({decimal_digits: "1,2"})
            .withMessage("Amount of milk must not exceed 2 decimal places")
            .isFloat({ min: 1.00 }).withMessage("Amount of milk should be a number greater than 1.0")
            .toFloat(),

        body("shift")
            .trim().escape().notEmpty().withMessage("Shift is required")
            .isAlpha().withMessage("Shift must be alphabetic")
            .toLowerCase()
            .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift"),
    ],

    read: [
        read(
            "milk record",
            async (pk) => await MilkRecord.findByPk(pk)
        ),
    ],

    update: [
        body("id")
            .trim().escape().notEmpty().withMessage("Record id is required")
            .isInt().withMessage("Record id should be an integer")
            .toInt()
            .custom( async (id) => {
                const record = await MilkRecord.findByPk(id);
                if (record === null) {
                    return Promise.reject("Milk record does not exist");
                }
                return true;
            }),

        body("farmerId")
            .optional()
            .trim().escape()
            .isInt().withMessage("Farmer id should be an integer")
            .toInt()
            .custom( async (farmerId) => {
                let user = await User.findByPk(farmerId);
                if (user === null) {
                    return Promise.reject("Invalid farmer id. User doesn't exist");
                } else if (user.dataValues.role !== "farmer") {
                    return Promise.reject("Invalid farmer id. User not a farmer");
                }
                return true;
            }),

        body("amount")
            .optional()
            .trim().escape()
            .isDecimal({decimal_digits: "1,2"})
            .withMessage("Amount of milk must not exceed 2 decimal places")
            .isFloat({min: 1.00}).withMessage("Amount must be a number greater than 1.0")
            .toFloat(),

        body("shift")
            .optional()
            .trim().escape().isAlpha().withMessage("Shift must be alphabetic")
            .toLowerCase()
            .isIn(["morning", "afternoon", "evening"]).withMessage("Invalid shift"),
    ],

    destroy: [
        destroy(
            "milk record",
            async (pk) => await MilkRecord.findByPk(pk)
        ),
    ],
};
