import {body} from "express-validator";
import toTitleCase from "../../utils/toTitleCase.js";
import db from "../../models/index.js";
import {AccountRules} from "./ValidationRules.js";

const {User} = db;

export const register = [
    body("email")
        .trim().escape().notEmpty().withMessage("Email is required")
        .isLength({min: 5, max: 30}).withMessage("Email must be between 5 and 30 characters")
        .isEmail().withMessage("Please provide a valid email address")
        .normalizeEmail().toLowerCase().bail()
        .custom( async email => {
            const user = await User.findOne({ where : { email } });
            if (user !== null) {
                return Promise.reject("This email address is already registered");
            }
            return true;
        }),

    body("firstName")
        .trim().escape().notEmpty().withMessage("First name is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("First name must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("First name must be between 2 and 30 characters")
        .bail()
        .customSanitizer((firstName) => {
            return toTitleCase(firstName);
        }),

    body("lastName")
        .trim().escape().notEmpty().withMessage("Last name is required")
        .matches(/^[A-Za-z\s]+$/).withMessage("Last name must be alphabetic")
        .isLength({min: 2, max: 30}).withMessage("Last name must be between 2 and 30 characters")
        .bail()
        .customSanitizer((lastName) => {
            return toTitleCase(lastName);
        }),

    body("password")
        .trim().escape().notEmpty().withMessage("Password is required")
        .isLength({min: 5, max: 30}).withMessage("Password must be at least 5 characters"),

    body("password2")
        .trim().escape().notEmpty().withMessage("Please confirm your password")
        .custom( (password2, {req}) => {
            if (password2 !== req.body.password) {
                throw new Error("Password confirmation does not match password");
            }
            return true;
        })
];

export const accountRules: AccountRules = {
    login: [
        body("email")
            .trim().escape().notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Please provide a valid email address")
            .normalizeEmail().toLowerCase().bail(),

        body("password")
            .trim().escape().notEmpty().withMessage("Password is required"),
    ],

    register,
}



