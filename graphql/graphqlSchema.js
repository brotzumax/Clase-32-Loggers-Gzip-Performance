import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Product {
    title: String
    price: Float
    thumbnail: String
  }

  type Query {
    getAllProducts: [Product]
  }

  type Mutation {
    addProduct(title: String!, price: Float!, thumbnail: String!): String
    updateProduct(title: String!, price: Float!, thumbnail: String!): String
    deleteProduct(title: String!): String
  }
`);

export default schema;