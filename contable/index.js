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

  async saveArticulo (articulo) {
    let connection = this.con

    let conn = await connection
    let id = articulo.id_articulo || 0
    let sql = ''
    if(id === 0) {
      sql = 'INSERT INTO articulos SET ?'
    } else {
      sql = `UPDATE articulos SET ? WHERE id_articulo = ${id}`
    }
    let result = await conn.query(sql, articulo)
    if(!result) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
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
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }

  async getArticulo (id) {
    let connection = this.con
    let conn = await connection
    let articulo = await conn.query(`SELECT * FROM articulos WHERE id_articulo = ${id}`)
    if(!articulo) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(articulo)
  }

  async getArticulos () {
    let connection = this.con
    let conn = await connection
    let articulos = await conn.query('SELECT * FROM articulos')
    if(!articulos) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(articulos)
  }

  async getMovimientos (tipo) {
    let connection = this.con
    let conn = await connection
    let movimientos = await conn.query(`SELECT * FROM movimientos WHERE tipo = ${tipo}`)
    if(!movimientos) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(movimientos)
  }
}

export default Contable
