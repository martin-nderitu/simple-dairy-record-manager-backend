import request from "supertest";
import {server} from "../../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());

describe("Admin Rate API", () => {
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

    it("should get all rates", async () => {
        const res = await agent
            .get("/api/admin/rates");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rates");
    });

    it("should filter rates", async () => {
        const query = "?from=2021-01-01&to=2021-12-31&sort=id asc, rate desc&limit=10&page=1" +
            "&startDate=2021-05-01&endDate=2021-07-31";
        const res = await agent
            .get(`/api/admin/rates${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rates");
    });

    it("should create a rate", async () => {
        const res = await agent
            .post("/api/admin/rates")
            .send({
                startDate: "2021-02-01",
                endDate: "2021-02-28",
                rate: "40"
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message");
    });

    it("should get a rate", async () => {
        const res = await agent
            .get("/api/admin/rates/100");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rate")
    });

    it ("should update a rate", async () => {
        const res = await agent
            .put("/api/admin/rates")
            .send({
                id: 200,
                rate: "40",
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

    it("should destroy a rate", async () => {
        const res = await agent
            .delete("/api/admin/rates/300");
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
