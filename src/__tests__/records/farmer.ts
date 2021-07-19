import request from "supertest";
import {server} from "../../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());

describe("Farmer Milk Record API", () => {
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

    it("should get all milk records", async () => {
        const res = await agent
            .get("/api/farmers/records");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("records");
    });

    it("should filter milk records", async () => {
        const query = "?from=2021-01-01&to=2021-12-31&sort=id asc, shift desc&limit=10&page=1";
        const res = await agent
            .get(`/api/farmers/records${query}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("records");
    });

    it("should get a milk record", async () => {
        const res = await agent
            .get("/api/farmers/records/300");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("record")
    });

    afterAll(async () => {
        const res = await agent
            .get("/api/accounts/logout");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });

});

