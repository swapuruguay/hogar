'use strict'

import mysql from 'promise-mysql'
import config from '../config'

class Contable {

  constructor () {
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

  async disconnect () {
    let connection = this.con
    let conn = await connection
    conn.destroy()
    return conn
  }

  async saveMovimiento (movimiento) {
    let connection = this.con

    let conn = await connection
    let id = movimiento.id_movimiento || 0
    let sql = ''
    if(id === 0) {
      sql = 'INSERT INTO movimientos SET ?'
    } else {
      sql = `UPDATE movimientos SET ? WHERE id_movimiento = ${id}`
    }
    let result = await conn.query(sql, movimiento)
    if(!result) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }
  
  async getMovimientos (tipo) {
    let connection = this.con
    let conn = await connection
    let movimientos = await conn.query(`SELECT * FROM movimientos WHERE tipo = ${tipo}`)
    if(!movimientos) {
      return Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(movimientos)
  }

  async getSaldoCaja() {
    let connection = this.con
    let conn = await connection
    let saldo = await conn.query('SELECT SUM(importe) as saldo FROM movimientos')
    if(!saldo) {
      return Promise.reject(new Error('No existen Datos'))
    }
    return Promise.resolve(saldo)
  }
}

export default Contable
