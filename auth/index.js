import LocalStrategy from "passport-local";
import Db from "../bd";
import bcrypt from "bcrypt-nodejs";

exports.strategy = new LocalStrategy(async function(username, password, done) {
  let db = new Db();
  let user = await db.getUser(` WHERE username = '${username}'`);
  db.disconnect();

  if (user.length > 0) {
    //let hash = bcrypt.hashSync(password)

    //console.log(bcrypt.compareSync(password, hash))
    if (bcrypt.compareSync(password, user[0].password)) {
      return done(null, user[0]);
    } else {
      return done(null, false, { message: "Usuario o Password Incorrecto" });
    }
  } else {
    return done(null, false, { message: "Usuario o Password Incorrecto" });
  }
});

exports.serialize = function(user, done) {
  done(null, user);
};

exports.deserialize = function(user, done) {
  done(null, user);
};
