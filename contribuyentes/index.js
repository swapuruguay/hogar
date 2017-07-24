'use strict'

import mysql from 'promise-mysql'
import config from '../config'

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
      return Promise.reject(new Error('Not Found'))
    }

    return Promise.resolve(listContribuyentes)

  }

  async pagarCuota(cuota) {
    let connection = this.con
    //let task = co.wrap(function * () {
    let conn = await connection
    let cate = await conn.query(`UPDATE cuotas SET estado = 2, fecha_pago = '${cuota.fecha}'
                  WHERE estado = 1 AND id_contribuyente_fk = ${cuota.id_contribuyente} ORDER BY id_cuota LIMIT 1`)
    if(!cate) {
      return Promise.reject(new Error('Not found'))
    }
    return Promise.resolve(cate)
  }

  async getCategoria(id) {


    let connection = this.con

    let conn = await connection
    let cate = await conn.query(`SELECT * FROM categorias WHERE id_categoria = ${id}`)
    if(!cate) {
      return Promise.reject(new Error('Not found'))
    }
    return Promise.resolve(cate)
  //  })

    //return Promise.resolve(task())

  }

  async getCategorias(where, order) {
    let cond = where || ''
    let orden = order || ''

    let connection = this.con

    //let task = co.wrap(function * () {
    let conn = await connection
    let cate = await conn.query(`SELECT * FROM categorias ${cond} ${orden}`)
    if(!cate) {
      return Promise.reject(new Error('Not found'))
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
      return Promise.reject(new Error('Not found'))
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

  async saveContribuyente(contri) {
    let connection = this.con

    let conn = await connection
    let id = contri.id_contribuyente || 0
    let sql = ''
    if(id === 0) {
      sql = 'INSERT INTO contribuyentes SET ?'
    } else {
      sql = `UPDATE contribuyentes SET ? WHERE id_contribuyente = ${id}`
    }
    let result = await conn.query(sql, contri)
    if(!result) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }

  async deleteContribuyente(idContribuyente) {
    let connection = this.con

    let conn = await connection
    let contris =  await conn.query(`UPDATE contribuyentes SET estado = 0 WHERE id_contribuyente = ${idContribuyente}`)
    if(!contris) {
      Promise.rejetc(new Error('Ocurrio un error'))
    }
    return Promise.resolve(contris)
  }

  async getCuotasPendientes(idContribuyente) {
    let connection = this.con

    let conn = await connection
    let contris =  await conn.query(`SELECT * FROM cuotas WHERE estado = 1 AND id_contribuyente_fk = ${idContribuyente}`)
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
    let sql = 'INSERT INTO cuotas (id_contribuyente_fk, mes, anio, importe, estado, fecha_emision) VALUES ?'
    let result = await conn.query(sql, [lista])
    if(!result) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)
  }

  async getDeudores() {
    let connection = this.con

    let conn = await connection
    let sql = `SELECT c.id_contribuyente, c.nombre, c.apellido, SUM(cu.importe) AS saldo FROM contribuyentes c
                JOIN cuotas cu ON c.id_contribuyente = cu.id_contribuyente_fk GROUP BY c.id_contribuyente HAVING saldo > 0`
    let result = await conn.query(sql)
    if(!result) {
      Promise.reject(new Error('Ocurrio un error'))
    }
    return Promise.resolve(result)

  }


}

export default Contribuyentes
