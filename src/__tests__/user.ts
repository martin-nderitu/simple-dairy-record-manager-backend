import request from "supertest";
import {server} from "../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());


describe("Admin User API", () => {
    beforeAll(async () => {
        const res = await agent
            .post("/api/accounts/login")
            .send({
                email: "admin@sdrm.com",
                password: "12345"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
    });

    it("should get all users", async () => {
        const res = await agent
            .get("/api/admin/users");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("users");
    });

    it("should filter users", async () => {
        const query = "?from=2021-01-01&to=2021-12-31&sort=id asc, role desc&limit=10&page=1" +
            "&idNameOrEmail=mkulima&role=farmer&active=true";
        const res = await agent
            .get(`/api/admin/users${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("users");
    })

    it("should create a user", async () => {
        const res = await agent
            .post("/api/admin/users")
            .send({
                email: "test@user.com",
                firstName: "test",
                lastName: "user",
                role: "farmer",
                active: true,
                password: "12345",
                password2: "12345",
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message");
    });

    it("should get a user", async () => {
        const res = await agent
            .get("/api/admin/users/100");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user")
    });

    it ("should update a user", async () => {
        const res = await agent
            .put("/api/admin/users")
            .send({
                id: 400,
                role: "milk collector",
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

    it("should destroy a user", async () => {
        const res = await agent
            .delete("/api/admin/users/400");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

    afterAll(async () => {
        const res = await agent
            .get("/api/accounts/logout");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });
});


