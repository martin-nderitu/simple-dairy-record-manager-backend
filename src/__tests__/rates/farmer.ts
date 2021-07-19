import request from "supertest";
import {server} from "../../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());

describe("Farmer Rate API", () => {
    beforeAll(async () => {
        const res = await agent
            .post("/api/accounts/login")
            .send({
                email: "mkulima@young.com",
                password: "12345"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
    });

    it("should get all rates", async () => {
        const res = await agent
            .get("/api/farmers/rates");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rates");
    });

    it("should filter rates", async () => {
        const query = "?from=2021-01-01&to=2021-12-31&sort=id asc, rate desc&limit=10&page=1";
        const res = await agent
            .get(`/api/farmers/rates${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rates");
    });

    it("should get a rate", async () => {
        const res = await agent
            .get("/api/farmers/rates/400");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("rate")
    });

    afterAll(async () => {
        const res = await agent
            .get("/api/accounts/logout");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

});
