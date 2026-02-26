import { Strategy as LocalStrategy } from 'passport-local'
import bcrypt from 'bcryptjs'
import Db from '../bd/index.js'

const strategy = new LocalStrategy(async (username, password, done) => {
  const db = new Db()
  const user = await db.getUser(` WHERE username = '${username}'`)
  await db.disconnect()

  if (user.length > 0 && bcrypt.compareSync(password, user[0].password)) {
    return done(null, user[0])
  }
  return done(null, false, { message: 'Usuario o Password Incorrecto' })
})

const serialize = (user, done) => {
  done(null, user)
}

const deserialize = (user, done) => {
  done(null, user)
}

export default {
  strategy,
  serialize,
  deserialize
}
