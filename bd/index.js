import mysql from 'promise-mysql'
import config from '../config'

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
}

export default Bd
