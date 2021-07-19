import db from "../models/index.js";

const users = [
    {
        "id": 100,
        "email": "admin@sdrm.com",
        "firstName": "admin",
        "lastName": "admin",
        "role": "admin",
        "active": true,
        "password": "12345",
    },
    {
        "id": 200,
        "email": "mkulima@young.com",
        "firstName": "mkulima",
        "lastName": "young",
        "role": "farmer",
        "active": true,
        "password": "12345",
    },
    {
        "id": 300,
        "email": "milk@man.com",
        "firstName": "milk",
        "lastName": "man",
        "role": "milk collector",
        "active": true,
        "password": "12345",
    },
    {
        "id": 400,
        "email": "example@user.com",
        "firstName": "example",
        "lastName": "user",
        "role": "farmer",
        "active": true,
        "password": "12345",
    },
];

// @ts-ignore
const seedUsers = async () => await db.User.bulkCreate(users);


export default seedUsers;