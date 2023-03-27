import knex from "knex";
import options from "../options/mysqlconn.js";

let instance = null;

class ClienteSQL {
    constructor(tableName) {
        this.tableName = tableName;
    }

    crearTablaProductos() {
        return this.knex.schema.createTable(this.tableName, table => {
            table.increments('id').primary();
            table.string('title', 50).notNullable();
            table.float('price');
            table.string('thumbnail', 100).notNullable();
        })
            .then(() => console.log("Tabla creada"))
            .catch(err => console.log(err));
    }

    crearTablaMensajes() {
        return this.knex.schema.createTable(this.tableName, table => {
            table.increments('id').primary();
            table.string('text', 300);
            table.string('email', 40).notNullable();
            table.string('date', 40).notNullable();
        })
            .then(() => console.log("Tabla creada"))
            .catch(err => console.log(err));
    }

    static getInstance(tablename) {
        if (!instance) {
            instance = new ClienteSQL(tablename);
        }
        return instance;
    }

    async destroyKnex() {
        await this.knex.destroy();
    }

    async newKnex() {
        this.knex = await knex(options);
    }
}

export default ClienteSQL;