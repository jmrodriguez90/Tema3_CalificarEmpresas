#!/usr/bin/env nodejs

/*
	CalificaEmpresas. Aplicación de ejemplo para los ejercicios del tema 1 de
  Cloud Computing del Máster Universitario en Ingeniería Informática.
	Copyright (C) 2015 Germán Martínez Maldonado

	This file is part of CalificaEmpresas.

	CalificaEmpresas is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	CalificaEmpresas is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

// Dependencias de la librería:
// "sqlite3" para gestionar la base de datos
var sqlite3 = require('sqlite3').verbose();
// "underscore" para tratar con las propiedades de los objetos
var _ = require("underscore");
// "bluebird" para manipular el comportamiento asíncrono de las conexiones a la base de datos mediante promesas
var Promise = require("bluebird");
// "fs" para comprobar externamente que existe el archivo de la base de datos
var fs = require("fs");

// Crear la base de datos 'calificaciones' y el objeto 'Empresa' sobre el que acceder a las funcionalidades
var db = new sqlite3.Database('calificaciones.db');
var Empresa = {};

// Método para comprobar si una empresa existe en la base de datos a partir de su nombre.
Empresa.existeEmpresa = function(data, res) {
  var stmt = db.prepare('SELECT name FROM sqlite_master WHERE type = "table" AND name = ?');
  stmt.bind(data.empresa);
  stmt.get(function(error, row) {
    if (error) {
      throw err;
    } else {
      if (row) {
        res(null, true);
      } else {
        res(null, false);
      }
    }
  });
};

// Método para comprobar si un alumno existe en la base de datos a partir de su nombre
var existeAlumno = function(data, res) {
  var stmt = db.prepare('SELECT alumno FROM ' + data.empresa + ' WHERE alumno = ?');
  stmt.bind(data.alumno);
  stmt.get(function(error, row) {
    if (error) {
      throw err;
    } else {
      if (row) {
        res(null, true);
      } else {
        res(null, false);
      }
    }
  });
};

// Método para obtener los nombres de todas las empresas en la base de datos
var obtenerEmpresas = function(res) {
  db.all('SELECT name FROM sqlite_master WHERE type = "table" AND name != "sqlite_sequence"',
    function(err, row) {
      if (err) {
        throw err;
      } else {
        res(null, row);
      }
    });
};

// Método para obtener el número de calificaciones y la calificación promedia de una empresa
var obtenerDatosRanking = function(empresa) {
  // Devuelve una promesa con la información sobre la empresa
  return new Promise(function(resolve, reject) {
    db.all('SELECT COUNT(id) AS numCalificaciones, AVG(calificacion) AS calificacionProm FROM ' + empresa,
      function(err, row) {
        resolve(row);
      });
  });
};

// Método para comprobar si existe el archivo de base de datos
Empresa.existeBaseDatos = function() {
  var encontrado;

  try {
    encontrado = fs.statSync('calificaciones.db').isFile();
  } catch (e) {
    encontrado = false;
  }

  return encontrado;
};

// Método para insertar una empresa en la base de datos
Empresa.crearEmpresa = function(data, res) {
  Empresa.existeEmpresa(data, function(error, valExisteEmpresa) {
    if (valExisteEmpresa === false) {
      var stmt = db.prepare('CREATE TABLE ' + data.empresa + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'alumno TEXT, calificacion INTEGER)');
      stmt.get(function(error, row) {
        if (error) {
          throw err;
        } else {
          var msg = 'Empresa ' + data.empresa + ' creada correctamente.';
          res(null, msg);
        }
      });
    } else {
      var msg = 'No se ha creado la empresa. Ya existe una empresa con el nombre ' + data.empresa +
        ' en la base de datos.';
      res(null, msg);
    }
  });
};

// Método para listar todas las calificaciones de una empresa en la base de datos
Empresa.listarCalificaciones = function(data, res) {
  Empresa.existeEmpresa(data, function(error, valExisteEmpresa) {
    if (valExisteEmpresa === true) {
      db.all("SELECT alumno,calificacion FROM " + data.empresa, function(err, rows) {
        if (err) {
          throw err;
        } else {
          res(null, rows);
        }
      });
    } else {
      var msg = 'No se han podido listar las calificaciones. La empresa ' + data.empresa +
        ' no se encuentra en la base de datos.';
      res(null, msg);
    }
  });
};

// Método para crear calificaciones para una empresa en la base de datos
Empresa.crearCalificacion = function(data, res) {
  Empresa.existeEmpresa(data, function(error, valExisteEmpresa) {
    if (valExisteEmpresa === true) {
      existeAlumno(data, function(error, valExisteAlumno) {
        if (valExisteAlumno === true) {
          var msg = 'No se ha podido añadir la calificación. Ya existe una calificación para la empresa ' +
            data.empresa + ' del alumno ' + data.alumno + '.';
          res(null, msg);
        } else {
          var stmt = db.prepare('INSERT INTO ' + data.empresa + ' VALUES (?,?,?)');
          stmt.bind(null, data.alumno, data.calificacion);
          stmt.get(function(error, row) {
            if (error) {
              throw err;
            } else {
              var msg = 'Calificación del alumno ' + data.alumno + ' para la empresa ' + data.empresa + ' añadida.';
              res(null, msg);
            }
          });
        }
      });
    } else {
      var msg = 'No se ha podido añadir la calificación. La empresa ' + data.empresa +
        ' no se encuentra en la base de datos.';
      res(null, msg);
    }
  });
};

// Método para borrar calificaciones de una empresa en la base de datos
Empresa.borrarCalificacion = function(data, res) {
  Empresa.existeEmpresa(data, function(error, valExisteEmpresa) {
    if (valExisteEmpresa === true) {
      existeAlumno(data, function(error, valExisteAlumno) {
        if (valExisteAlumno === false) {
          var msg = 'No se ha podido borrar la calificación. No existe una calificación para la empresa ' +
            data.empresa + ' del alumno ' + data.alumno + ' en la base de datos.';
          res(null, msg);
        } else {
          var stmt = db.prepare('DELETE FROM ' + data.empresa + ' WHERE alumno = ?');
          stmt.bind(data.alumno);
          stmt.get(function(error, row) {
            if (error) {
              throw err;
            } else {
              var msg = 'Calificación del alumno ' + data.alumno + ' para la empresa ' + data.empresa + ' borrada.';
              res(null, msg);
            }
          });
        }
      });
    } else {
      var msg = 'No se ha podido borrar la calificación. La empresa ' + data.empresa +
        ' no se encuentra en la base de datos.';
      res(null, msg);
    }
  });
};

// Método para actualizar calificaciones de una empresa en la base de datos
Empresa.actualizarCalificacion = function(data, res) {
  Empresa.existeEmpresa(data, function(error, valExisteEmpresa) {
    if (valExisteEmpresa === true) {
      existeAlumno(data, function(error, valExisteAlumno) {
        if (valExisteAlumno === false) {
          var msg = 'No se ha podido actualizar la calificación. No existe una calificación para la empresa ' +
            data.empresa + ' del alumno ' + data.alumno + ' en la base de datos.';
          res(null, msg);
        } else {
          var stmt = db.prepare('UPDATE ' + data.empresa + ' SET calificacion = ? WHERE alumno = ?');
          stmt.bind(data.calificacion, data.alumno);
          stmt.get(function(error, row) {
            if (error) {
              throw err;
            } else {
              var msg = 'Calificación del alumno ' + data.alumno + ' para la empresa ' + data.empresa + ' actualizada.';
              res(null, msg);
            }
          });
        }
      });
    } else {
      var msg = 'No se ha podido actualizar la calificación. La empresa ' + data.empresa +
        ' no se encuentra en la base de datos.';
      res(null, msg);
    }
  });
};

// Método para generar el ranking ordenador según calificación promedia de todas las empresas en la base de datos
Empresa.generarRanking = function(res) {
  var empresas = [];
  var ranking = [];
  var i = 0;

  obtenerEmpresas(function(error, data) {
    _.each(data, function(valor) {
      empresas.push(obtenerDatosRanking(valor.name));
    });

    // Pedimos una promesa para obtener información por cada una de las empresas
    Promise.all(empresas).then(function(results) {
      _.each(results, function(valor) {
        var calificacionProm = valor[0].calificacionProm;

        if (_.isNull(calificacionProm)) {
          calificacionProm = 0;
        }

        var datosEmpresa = {
          "empresa": data[i++].name,
          "numCalificaciones": valor[0].numCalificaciones,
          "calificacionProm": calificacionProm
        };
        ranking.push(datosEmpresa);
      });

      // Ordenamos el ranking según la calficación promedia y le damos la vuelta para que quede ordenado de forma descendente
      ranking = _.sortBy(ranking, "calificacionProm").reverse();
      res(null, ranking);
    });
  });
};

// Exportar la librería para poder utilizar sus funcionalidades
module.exports = Empresa;
