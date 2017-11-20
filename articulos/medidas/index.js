import mysql from 'promise-mysql'
import config from '../../config'

class Medidas {

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

  async delete(idMedida) {
    let connection = this.con
    let conn = await connection
    let res = conn.query(`DELETE FROM medidas WHERE id_medida = ${idMedida}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error al intentar borrar'))
    }

    return Promise.resolve(res)
  }

  async save(medida) {
    let connection = this.con
    let conn = await connection
    let sql = ''
    if(medida.id_medida === 0) {
      sql = 'INSERT INTO medidas SET ?'
    } else {
      sql = `UPDATE medidas SET ? WHERE id_medida = ${medida.id_medida}`
    }

    let res = conn.query(sql, medida)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error al intentar guardar'))
    }

    return Promise.resolve(res)
  }

  async getMedidas(where, order) {
    let cond = where || ''
    let orden = order || ''
    let connection = this.con
    let conn = await connection
    let res = await conn.query(`SELECT * FROM medidas ${cond} ${orden}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error intente más tarde'))
    }
    return Promise.resolve(res)
  }

  async getMedida(id) {
    let connection = this.con
    let conn = await connection
    let res = await conn.query(`SELECT * FROM medidas ${id}`)
    if(!res) {
      return Promise.reject(new Error('Ocurrió un error intente más tarde'))
    }
    return Promise.resolve(res)
  }

}

export default Medidas
