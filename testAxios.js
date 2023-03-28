import axios from "axios";

const API_URL = 'http://localhost:8080/products/';


async function testGetAll() {
    const response = await axios.get(`${API_URL}getAll`);
    return response.data;
}

async function testUpdate() {
    const data = {
        oldTitle: "XXXXX",
        newProduct: {
            title: "XXXXX",
            price: 99999,
            thumbnail: "www.XXXXXXXXXX.com"
        }
    }
    const response = await axios.put(`${API_URL}update`, data);
    return response.data;
}


console.log(await testGetAll());