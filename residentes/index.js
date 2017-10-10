
const mysql = require('promise-mysql')
let config = require('../config')

class Residentes {

  constructor() {
    this.connect()
  }

  cconnect() {

    let options = {
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database
    }

    this.con = mysql.createConnection(options)

    let connection = this.con

    return Promise.resolve(connection)
  }

  async disconnect() {
    let connection = this.con
    let conn = await connection
    conn.destroy()
    return conn
  }

  async saveResidente(residente) {

    let connection = this.con
    let conn = await connection
    let sql = 'INSERT INTO cuotas (id_residente, nombre, apellido, documento, fecha_nacimiento, mutualista, cuidados, fecha_ingreso) VALUES ?'
    let result = await conn.query(sql, residente)
    if(!result) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }

  /*delResidente(id) {

  }*/

  async getResidentes() {
    let connection = this.con

    let conn = await connection
    let lista = await conn.query('SELECT * FROM residentes WHERE estado = 1')
    if(!lista) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(lista)

  }

  async delResidente(id) {
    let connection = this.con

    let conn = await connection
    let result = await conn.query(`DELETE FROM residentes WHERE id_residente=${id}`)
    if(!result) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }

  async getResidente(id) {
    let connection = this.con
    let conn = await connection
    let residente = await conn.query(`SELECT * FROM residentes WHERE estado = 1 AND id_residente = ${id}`)
    if(!residente) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(residente)
  }

}

module.exports = Residentes
