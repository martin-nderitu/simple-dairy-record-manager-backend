import {param} from "express-validator";

export const read = (name: string, callback: { (pk: number): any }, fields: string | string[] = "id") => {
    return param(fields)
        .trim().escape().notEmpty().withMessage(`${name} id is required`)
        .isInt().withMessage(`${name} id must be an integer`)
        .toInt()
        .custom(async (id) => {
            const response = await callback(parseInt(id));
            if (response === null) {
                return Promise.reject(`${name} with id '${id}' does not exist`);
            }
            return true;
        });
}