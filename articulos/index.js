import mysql from 'promise-mysql'
import config from '../config'

class Articulos {

  constructor() {
    this.connect()
  }

  connect() {
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

  async disconect() {
    let connection = this.con
    let conn = await connection
    conn.destroy()
    return conn
  }

  async delete(idArticulo) {
    let connection = this.con
    let conn = await connection
    let res = conn.query(`DELETE FROM articulos WHERE id_articulo = ${idArticulo}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error al intentar borrar'))
    }

    return Promise.resolve(res)
  }

  async save(articulo) {
    let connection = this.con
    let conn = await connection
    let id = articulo.id_articulo || 0
    let sql = ''
    if(id === 0) {
      sql = 'INSERT INTO articulos SET ?'
    } else {
      sql = `UPDATE articulos SET ? WHERE id_articulo = ${articulo.id_articulo}`
    }

    let res = conn.query(sql, articulo)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error al intentar guardar'))
    }

    return Promise.resolve(res)
  }

  async getArticulos(where, order) {
    let cond = where || ''
    let orden = order || ''
    let connection = this.con
    let conn = await connection
    let res = await conn.query(`SELECT * FROM articulos ${cond} ${orden}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error intente más tarde'))
    }
    return Promise.resolve(res)
  }

  async getArticulo(id) {
    let connection = this.con
    let conn = await connection
    let res = await conn.query(`SELECT * FROM articulos WHERE id_articulo = ${id}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error intente más tarde'))
    }
    return Promise.resolve(res)
  }

}

export default Articulos
