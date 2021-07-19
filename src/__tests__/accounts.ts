import request from "supertest";
import {server} from "../app.js";

const agent = request.agent(server);

afterAll(async () => await server.close());


describe("Accounts API", () => {
    it("should register a farmer", async () => {
        const res = await agent
            .post("/api/accounts/register")
            .send({
                email: "test@farmer.com",
                firstName: "test",
                lastName: "farmer",
                password: "12345",
                password2: "12345",
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
    });

    it("should login the registered farmer", async () => {
        const res = await agent
            .post("/api/accounts/login")
            .send({
                email: "test@farmer.com",
                password: "12345"
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("user");
    });

    afterAll(async () => {
        const res = await agent
            .get("/api/accounts/logout");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("message");
    });
});

