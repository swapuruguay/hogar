'use strict'

import mysql from 'promise-mysql'
import config from '../config'

class Ingresos {

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

  async addIngreso(ingreso) {

    let connection = this.con

    //let task = co.wrap(function * () {
    let conn = await connection
    let sql = 'INSERT INTO ingresos SET ?'
    let result = await conn.query(sql, ingreso)
    if(!result) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)

  }



}

export default Ingresos
