import request from "supertest";
import {server} from "../../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());

describe("Admin Milk Record API", () => {
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

    it("should get all milk records", async () => {
        const res = await agent
            .get("/api/admin/records");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("records");
    });

    it("should filter milk records", async () => {
        const query = "?from=2021-01-01&to=2021-12-31&sort=id asc, shift desc&limit=10&page=1" +
            "&shift=morning&farmer=mkulima&milkCollector=milk@man.com";
        const res = await agent
            .get(`/api/admin/records${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("records");
    });

    it("should create a milk record", async () => {
        const res = await agent
            .post("/api/admin/records")
            .send({
                amount: "55",
                shift: "morning",
                farmerId: "200",
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message");
    });

    it("should get a milk record", async () => {
        const res = await agent
            .get("/api/admin/records/100");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("record")
    });

    it ("should update a record", async () => {
        const res = await agent
            .put("/api/admin/records")
            .send({
                id: 200,
                shift: "morning",
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

    it("should destroy a record", async () => {
        const res = await agent
            .delete("/api/admin/records/300");
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
