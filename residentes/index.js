import mysql from "promise-mysql";
import config from "../config";

class Residentes {
  constructor() {
    this.connect();
  }

  connect() {
    let options = {
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database
    };

    this.con = mysql.createConnection(options);

    let connection = this.con;

    return Promise.resolve(connection);
  }

  async disconnect() {
    let connection = this.con;
    let conn = await connection;
    conn.destroy();
    return conn;
  }

  async saveResidente(residente) {
    let connection = this.con;
    let conn = await connection;
    let id = residente.id_residente || 0;
    let sql = "";
    if (id === 0) {
      sql = "INSERT INTO residentes SET ?";
    } else {
      sql = `UPDATE residentes SET ? WHERE id_residente = ${id}`;
    }

    let result = await conn.query(sql, residente);
    if (!result) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(result);
  }

  async savePariente(pariente) {
    let connection = this.con;
    let conn = await connection;
    let id = pariente.id_pariente || 0;
    let sql = "";
    if (id === 0) {
      sql = "INSERT INTO parientes SET ?";
    } else {
      sql = `UPDATE parientes SET ? WHERE id_pariente = ${id}`;
    }

    let result = await conn.query(sql, pariente);
    if (!result) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(result);
  }

  /*delResidente(id) {

  }*/

  async getResidentes(where, order) {
    let connection = this.con;
    let cond = where || "";
    let orden = order || "";
    let conn = await connection;
    let lista = await conn.query(`SELECT * FROM residentes ${cond} ${orden}`);
    if (!lista) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(lista);
  }

  async getParientesResidente(id) {
    let connection = this.con;
    let conn = await connection;
    let parientes = await conn.query(
      `SELECT * FROM parientes WHERE id_residente_fk = ${id}`
    );
    if (!parientes) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(parientes);
  }

  async delResidente(id) {
    let connection = this.con;

    let conn = await connection;
    let result = await conn.query(
      `DELETE FROM residentes WHERE id_residente=${id}`
    );
    if (!result) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(result);
  }

  async deletePariente(id) {
    let connection = this.con;

    let conn = await connection;
    let result = await conn.query(
      `DELETE FROM parientes WHERE id_residente_fk=${id}`
    );
    if (!result) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(result);
  }

  async getResidente(id) {
    let connection = this.con;
    let conn = await connection;
    let residente = await conn.query(
      `SELECT * FROM residentes WHERE estado = 1 AND id_residente = ${id}`
    );
    if (!residente) {
      return Promise.reject(new Error("Ocurrio un error"));
    }
    return Promise.resolve(residente);
  }
}

export default Residentes;
