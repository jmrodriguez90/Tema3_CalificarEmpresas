#!/usr/bin/env nodejs

/*
Código de [Germán Martínez](https://github.com/germaaan), usado por [José M. Rodríguez](https://github.com/jmrodriguez90) para la realización de los ejercicios de la clase de Cloud Computing del Máster en Ingeniería informática de la UGR
*/


// Dependencias
var _ = require("underscore");
var assert = require("assert");
var request = require("supertest");
var should = require("should");

// Módulos de la aplicación
var app = require('../app.js');
var empresa = require('../lib/empresa');

describe('Tests básicos', function() {
  it('Existe base de datos', function(done) {
    assert.equal(empresa.existeBaseDatos(), true);
    done();
  });

  it('Creación de empresas', function(done) {
    empresa.crearEmpresa({
      empresa: "prueba"
    }, function(error, data) {
      empresa.existeEmpresa({
        empresa: "prueba"
      }, function(error, data) {
        assert.equal(data, true);
      });
    });
    done();
  });

  it('Generación de ranking', function(done) {
    empresa.generarRanking(function(error, data) {
      _.each(data, function(valor) {
        valor.should.have.property("empresa");
        valor.should.have.property("numCalificaciones");
        valor.should.have.property("calificacionProm");
      });
    });
    done();
  });
});

// Prueba de acceso a la página
describe('Prueba de acceso', function() {
  it("Página principal", function(done) {
    request(app)
      .get("/")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Crear empresa", function(done) {
    request(app)
      .get("/crearEmpresa/EMPRESA")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Listar calificaciones empresa", function(done) {
    request(app)
      .get("/listarCalificaciones/EMPRESA")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Crear calificación alumno empresa", function(done) {
    request(app)
      .get("/crearCalificacion/EMPRESA/ALUMNO/0")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Actualizar calificación alumno empresa", function(done) {
    request(app)
      .get("/actualizarCalificacion/EMPRESA/ALUMNO/100")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Borrar calificación alumno empresa", function(done) {
    request(app)
      .get("/borrarCalificacion/EMPRESA/ALUMNO")
      .expect("Content-Type", /text\/html/)
      .expect(200, done);
  });
  it("Generar ranking empresas", function(done) {
    request(app)
      .get("/generarRanking")
      .expect(200, done);
  });
  it("Página de error", function(done) {
    request(app)
      .get("/foo")
      .expect(404)
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        done();
      });
  });
});
