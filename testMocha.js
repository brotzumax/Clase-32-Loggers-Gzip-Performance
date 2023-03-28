import supertest from "supertest";
import chai from "chai";
import { describe } from "mocha";

const request = supertest('http://localhost:8080');
const expect = chai.expect;

describe("Test api rest full"), () => {
    describe("GET", () => {
        it("Debería retornar un status 200", async () => {
            let response = await request.get("/products/getAll")
            expect(response.status).to.eql(200)
        })
    })

    describe("PUT", () => {
        it("Debería modificar un producto", async () => {
            let data = {
                oldTitle: "XXXXX",
                newProduct: {
                    title: "XXXXX",
                    price: 99999,
                    thumbnail: "www.XXXXXXXXXX.com"
                }
            }

            let response = await request.put("/products/update").send(data)
            expect(response.status).to.eql(200)
        })
    })
}

