const db = require("../database/models");
const bcrypt = require("bcryptjs");

const userController = {
  index: function (req, res) {
    if (req.session.usuario === undefined) {
      return res.redirect("/register");
    }
    res.render("login");
  },
  register: function (req, res) {
    if (req.session !== undefined && req.session.usuario !== undefined) {
      return res.redirect("/profile");
    }
    res.render("register", { usuario: undefined });
  },
  profile: function (req, res) {
    res.render("profile", { usuario: db.usuario });
  },
  profileEdit: function (req, res) {
    res.render("profile-edit");
  },
  store: function (req, res) {
    const encriptada = bcrypt.hashSync(req.body.contrasenia, 10);
    let usuario = {
      email: req.body.email,
      contrasenia: encriptada,
      usuario: req.body.usuario,
      dni: req.body.doc,
      fecha: req.body.fecha,
      fotoPerfil: req.body.fotoPerfil,
    };
    db.Usuario.create(usuario);
    res.redirect("/");
  },
  login: function (req, res) {
    db.Usuario.findOne({
      where: {
        email: req.body.email,
      },
    }).then(function (usuario) {
      if (usuario) {
        if (bcrypt.compareSync(req.body.password, usuario.password)) {
          req.session.usuario = usuario;
          if (req.body.remember) {
            res.cookie("user", usuario.id, { maxAge: 1000 * 60 * 60 * 24 }); //24 horas de vida
          }
          res.redirect("/profile");
        } else {
          res.send("contraseña incorrecta");
        }
      } else {
        res.send("el mail no se encuentra registrado");
      }
    });
  },
  logout: function (req, res) {
    req.session.destroy();
    res.clearCookie("user");
    res.redirect("/");
  },
};

module.exports = userController;
