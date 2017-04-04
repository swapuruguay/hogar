'use strict'

const mysql = require('promise-mysql')
const config = require('../config')

class Contribuyentes {

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

  async getContribuyentes(where, order) {
    let cond = where || ''
    let orden = order || ''


    let connection = this.con

    //let task = co.wrap(function * () {
      let conn = await connection
      let listContribuyentes = await conn.query(`SELECT * FROM contribuyentes ${cond} ${orden}`)

      if(!listContribuyentes) {
        return Promise.reject(new Error(`Not found`))
      }

      return Promise.resolve(listContribuyentes)

  //  })

    //return Promise.resolve(task())

  }

  async getCategoria(id) {


    let connection = this.con

    //let task = co.wrap(function * () {
      let conn = await connection
      let cate = await conn.query(`SELECT * FROM categorias WHERE id_categoria = ${id}`)

      if(!cate) {
        return Promise.reject(new Error(`Not found`))
      }

      return Promise.resolve(cate)

  //  })

    //return Promise.resolve(task())

  }

  async getCiclos() {
    let connection = this.con
    let conn = await connection
      let ciclos = conn.query('SELECT * FROM ciclos')
      if(!ciclos) {
        return Promise.reject(new Error('Not found'))
      }
      return Promise.resolve(ciclos)

  }

  async getContribuyente(id) {


    let connection = this.con


      let conn = await connection
      let contribuyente = await conn.query(`SELECT * FROM contribuyentes WHERE id_contribuyente = ${id}`)

      if(!contribuyente) {
        return Promise.reject(new Error(`Not found`))
      }

      return Promise.resolve(contribuyente)


  }

  async getByCiclo(ciclo) {
    let connection = this.con

    let conn = await connection
      let contris = await conn.query(`SELECT * FROM contribuyentes WHERE id_ciclo_fk = ${ciclo}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)
  }

  async getByCategoria(categoria) {
    let connection = this.con

    let conn = await connection
      let contris = await conn.query(`SELECT * FROM contribuyentes WHERE id_categoria_fk = ${categoria}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)


  }

  saveContribuyente(contri) {


  }

  deleteContribuyente(contri) {

  }

  async getCuotasPendientes(idContribuyente) {
    let connection = this.con

    let conn = await connection
      let contris =  await conn.query(`SELECT * FROM cuotas WHERE estado = 0 AND id_contribuyente_fk = ${idContribuyente}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)

  }

  async getCuotas(mes, anio) {
    let connection = this.con


      let conn = await connection
      let contris = await conn.query(`SELECT * FROM cuotas WHERE mes = ${mes} AND anio = ${anio}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)

  }

  getCuotasSinCobrar() {

  }

  async generarCli(lista) {
    let connection = this.con

    let conn = await connection
      let sql = 'INSERT INTO contribuyentes (nombre, apellido, domicilio, id_categoria_fk, id_ciclo_fk, mes_pago, estado, fecha_alta, telefono) VALUES ?'
      let result = await conn.query(sql, [lista])
      if(!result) {
        Promise.reject(new Error('Ocurrio un error'))
      }

      return Promise.resolve(result)

  }

  async generarCuotas(lista) {

    let connection = this.con

    let conn = await connection
      let sql = "INSERT INTO cuotas (id_contribuyente_fk, mes, anio, importe, estado, fecha_emision) VALUES ?"
      let result = await conn.query(sql, [lista])
      if(!result) {
        Promise.reject(new Error('Ocurrio un error'))
      }

      return Promise.resolve(result)


  }


}

module.exports = Contribuyentes
