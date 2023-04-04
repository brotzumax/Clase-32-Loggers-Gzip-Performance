import ProductosApi from "../services/ProductosAPI";

const productosApi = new ProductosApi();

const root = {
    getAllProducts: async () => {
        const products = await productosApi.getProducts();
        return products;
    },
    addProduct: async ({ title, price, description }) => {
        await productosApi.getProducts({ title, price, description })
        return "Producto añadido";
    },
    updateProduct: async ({ title, price, description }) => {
        await productosApi.updateProduct({ title, price, description });
        return "Producto actualizado";
    },
    deleteProduct: async ({ title }) => {
        await productosApi.deleteProduct(title);
        return "Producto eliminado";
    },
};

export default root;