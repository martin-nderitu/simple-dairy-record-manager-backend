import { Request, Response, NextFunction } from "express";
import log from "../../utils/log.js"
import db from "../../models/index.js";

const {User} = db;

async function users(req: Request, res: Response, next: NextFunction) {
    try {
        const {filter, pagination} = res.locals;
        const {count, rows} = await User.findAndCountAll({
            attributes: { exclude: ["password"] },
            ...filter,
        });
        if (count) {
            pagination.count = count;
            return res.status(200).json({ users: rows, pagination })
        } else {
            return res.status(400).json({
                error: "No users found"
            });
        }
    } catch (error) {
        log("\n\nError getting users:", error, "\n\n");
        next({ status: 500, error: "Db error getting users" });
    }
}

async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, firstName, lastName, role, active, password } = req.body;
        const newUser = await User.create({
            email, firstName, lastName, role, active, password
        });
        if (newUser.dataValues) {
            return res.status(201).json({
                message: "User created successfully"
            });
        } else {
            return res.status(400).json({
                error: "User not created. Please try again"
            });
        }
    } catch (error) {
        log("\n\nError creating user:", error, "\n\n");
        next({ status: 500, error: "Db error creating user"})
    }
}

async function read(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await User.findByPk(req.params.id);
        if (user === null) {
            return res.status(400).json({
                error: "User does not exist"
            });
        } else {
            return res.status(200).json({ user });
        }
    } catch (error) {
        log("\n\nError getting user:", error, "\n\n");
        next({ status: 500, error: "Db error getting user" });
    }
}

async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { id, firstName, lastName, role, active } = req.body;
        let updatedUser = await User.update({
            firstName, lastName, role, active
        }, { where: { id } });

        if (updatedUser[0]) {
            return res.status(200).json({
                message: "User updated successfully"
            });
        } else {
            return res.status(400).json({
                error: "Error updating user. Please try again"
            });
        }
    } catch (error) {
        log("\n\nError updating user:", error);
        next({ status: 500, error: "Db error updating user" });
    }
}

async function destroy(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;    // an array of one or more user ids
    try {
        const rowsDeleted = await User.destroy({ where: {id} });
        if (rowsDeleted !== id.length) {
            const notDeleted = id.length - rowsDeleted;
            return res.status(400).json({
                error: `${notDeleted} user(s) not deleted. Please try again`
            });
        } else {
            return res.status(200).json({
                message: `${id.length} user(s) deleted successfully`
            });
        }
    } catch (error) {
        log("Error deleting user(s):", error);
        next({ status: 500, error: "Db error deleting user(s)"})
    }
}

export {
    users, create, read, update, destroy
}