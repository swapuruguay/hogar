import mysql from 'promise-mysql'
import config from '../config.js'

class Bd {

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

  async disconnect() {
    let connection = this.con
    let conn = await connection
    conn.destroy()
    return conn
  }

  getUser(where, order) {
    let orden = order || '', cond = where || ''
    let connection = this.con
    let task = async function () {
      let conn = await connection
      let user = await conn.query(`SELECT * FROM usuarios  ${cond} ${orden}`)
      if (!user) {
        return Promise.reject(new Error('not found'))
      }
      return Promise.resolve(user)
    }
    return Promise.resolve(task())
  }

  async updateUserPassword(idUsuario, passwordHash) {
    const connection = this.con
    const conn = await connection
    const result = await conn.query(
      'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
      [passwordHash, idUsuario]
    )

    if (!result) {
      return Promise.reject(new Error('No se pudo actualizar la contraseña'))
    }
    return Promise.resolve(result)
  }
}

export default Bd
