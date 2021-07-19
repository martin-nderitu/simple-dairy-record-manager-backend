import {Request, Response, NextFunction} from "express";
import * as argon2 from "argon2";
import log from "../../utils/log.js"
import db from "../../models/index.js";

const {User} = db;

// farmer registration
async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, firstName, lastName, password } = req.body;
        const newUser = await User.create({ email, firstName, lastName, password });

        if (newUser.dataValues) {
            req.session.regenerate( (err) => {
                if (err) {
                    return res.status(400).json({
                        error: "Unable to register. Please try again"
                    });
                }
                const user = newUser.dataValues;
                delete user.password;
                req.session.user = user;

                req.session.save((err) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Unable to login after registration. Please try again"
                        });
                    } else {
                        return res.status(200).json({ user });
                    }
                })
            });
        } else {
            return res.status(400).json({
                error: "Error during registration. Please try again"
            });
        }
    } catch (error) {
        log("Error during registration: ", error);
        next({ status:500, error: "Db error registering user" });
    }
}

async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const {email, password} = req.body;
        const response = await User.findOne({ where: {email} });

        if (response === null) {
            return res.status(400).json({
                error: "Incorrect email"
            })
        } else {
            const user = response.dataValues;
            const passwordCorrect = await argon2.verify(user.password, password);

            if (!passwordCorrect) {
                return res.status(400).json({
                    error: "Incorrect password"
                });
            } else {
                req.session.regenerate( (err) => {
                    if (err) {
                        log("\n\nLogin error: ", err, "\n\n");
                        return res.status(400).json({
                            error: "Unable to login. Please try again"
                        });
                    }

                    delete user.password;
                    req.session.user = user;

                    req.session.save((err) => {
                        if (err) {
                            log("\n\nError saving session on login: ", err, "\n\n");
                            return res.status(400).json({
                                error: "Unable to login. Please try again"
                            });
                        } else {
                            return res.status(200).json({ user });
                        }
                    })
                });
            }
        }
    } catch (error) {
        log("Error during login: ", error);
        next({ status:500, error: "Db error logging in" });
    }
}

function isLoggedIn(req: Request, res: Response) {
    if (req.session.user) {
        return res.status(200).json({ user: req.session.user });
    } else {
        return res.status(400).json({ error: "Not logged in" });
    }
}

function logout(req: Request, res: Response) {
    if (req.session.user) {
        req.session.destroy( (err) => {
            if (err) {
                log("\n\nError on logout: ", err, "\n\n");
                return res.status(400).json({
                    error: "Unable to logout. Please try again"
                });
            }
            else {
                return res.status(200).json({ message: "Logout success" });
            }
        });
    } else {
        return res.status(400).json({
            error: "You are not logged in"
        });
    }
}

export {
    register, login, isLoggedIn, logout
}