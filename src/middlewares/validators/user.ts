import {check, query, body, oneOf} from "express-validator";
import toTitleCase from "../../utils/toTitleCase.js";
import db from "../../models/index.js";
import {pagination} from "./common/pagination.js";
import {sorting} from "./common/sorting.js";
import {destroy} from "./common/destroy.js";
import {read} from "./common/read.js";
import {ValidationRules} from "./ValidationRules.js";
import {register} from "./accounts.js";
import {dateFrom, dateTo} from "./common/filters.js";

const {User} = db;

export const userRules: ValidationRules = {

    filter: [
        oneOf([
            check("idNameOrEmail")
                .optional({ checkFalsy: true })
                .trim().escape().isInt().toInt(),

            check("idNameOrEmail")
                .optional({ checkFalsy: true })
                .trim().escape().isEmail().normalizeEmail().toLowerCase(),

            check("idNameOrEmail")
                .optional({ checkFalsy: true })
                .trim().escape().matches(/^[A-Za-z\s]+$/),
                // .customSanitizer(name => toTitleCase(name))
        ], "id, name or email must be either a number, valid email or alphabetical"),

        query("role")
            .optional({checkFalsy: true})
            .trim().escape().toLowerCase()
            .isIn(["admin", "farmer", "milk collector"]).withMessage("Invalid role"),

        query("active")
            .optional({checkFalsy: true})
            .trim().escape()
            .toLowerCase()
            .customSanitizer((active) => {
                if (active !== "true" && active !== "false") { return undefined; }
                return active;
            }),

        dateFrom,
        dateTo,
        ...pagination,
        ...sorting,
    ],

    create: [
        ...register,

        body("role")
            .trim().escape().notEmpty().withMessage("Role is required")
            .matches(/^[A-Za-z\s]+$/).withMessage("Role must be alphabetic")
            .toLowerCase()
            .isIn(["admin", "farmer", "milk collector"])
            .withMessage("Invalid role. Enter 'admin', 'farmer' or 'milk collector'")
            .escape(),

        body("active")
            .optional({checkFalsy: true})
            .trim().escape()
            .matches(/^[A-Za-z]+$/).withMessage("Active must be alphabetic")
            .toLowerCase()
            .isIn(["true", "false"]).withMessage("Invalid value. Enter 'true' or 'false'"),
    ],

    read: [
        read(
            "user",
            async (pk) => await User.findByPk(pk)
        ),
    ],

    update: [

        body("id")
            .trim().escape().notEmpty().withMessage("User id is required")
            .isInt().withMessage("User id must be an integer")
            .toInt()
            .custom(async (id) => {
                // check if user exists in db
                const user = await User.findByPk(id);
                if (user === null) {
                    throw new Error("User does not exist");
                }
                return true;
            }),

        body("firstName")
            .optional()
            .trim().escape()
            .matches(/^[A-Za-z\s]+$/).withMessage("First name must be alphabetic")
            .isLength({min: 2, max: 30}).withMessage("First name must be between 2 and 30 characters")
            .bail()
            .customSanitizer((firstName) => {
                return toTitleCase(firstName);
            }),

        body("lastName")
            .optional()
            .trim().escape()
            .matches(/^[A-Za-z\s]+$/).withMessage("Last name must be alphabetic")
            .isLength({min: 2, max: 30}).withMessage("Last name must be between 2 and 30 characters")
            .bail()
            .customSanitizer((lastName) => {
                return toTitleCase(lastName);
            }),

        body("role")
            .optional({checkFalsy: true})
            .trim().escape()
            .matches(/^[A-Za-z\s]+$/).withMessage("Role must be alphabetic")
            .toLowerCase()
            .isIn(["admin", "farmer", "milk collector"])
            .withMessage("Invalid role. Enter 'admin', 'farmer' or 'milk collector'"),

        body("active")
            .optional({checkFalsy: true})
            .trim().escape()
            .matches(/^[A-Za-z]+$/).withMessage("Active must be alphabetic")
            .toLowerCase()
            .isIn(["true", "false"]).withMessage("Invalid value. Enter 'true' or 'false'"),
    ],

    destroy: [
        destroy(
            "user",
            async (pk) => await User.findByPk(pk)
        ),
    ],
}
