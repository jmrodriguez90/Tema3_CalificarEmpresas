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

// Dependencias
var express = require('express');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');
global.appRoot = path.resolve(__dirname);

// Rutas
var index = require(appRoot + '/routes/index');

// Crea aplicación web con Express
var app = express();

// Dirección IP y puerto de escucha de peticiones
app.set('ip', process.env.IP || '0.0.0.0');
app.set('port', process.env.PORT || 5000);
// Directorio con las plantillas
app.set('views', path.join(appRoot, 'views'));
// Motor de visualización
app.set('view engine', 'jade');

// Favicon
app.use(favicon(appRoot + '/public/images/favicon.ico'));
// Logger de solicitudes HTTP
app.use(logger('dev'));
// Parseadores
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
//Manejador de enrutado
app.use(express.static(path.join(appRoot, 'public')));

// Funcionalidades
app.get('/', index.index);
app.get('/crearEmpresa/:empresa', index.crearEmpresa);
app.get('/listarCalificaciones/:empresa', index.listarCalificaciones);
app.get('/crearCalificacion/:empresa/:alumno/:calificacion', index.crearCalificacion);
app.get('/borrarCalificacion/:empresa/:alumno', index.borrarCalificacion);
app.get('/actualizarCalificacion/:empresa/:alumno/:calificacion', index.actualizarCalificacion);
app.get('/generarRanking', index.generarRanking);

// Captura errores 404 y los reenvia al manejador de errores
app.use(function(req, res, next) {
  var err = new Error('Error 404: Página no encontrada.');
  err.status = 404;
  next(err);
});

// Manejador de errores:
app.use(function(err, req, res, next) {
  res.status(err.status).render('error', {
    message: err.message,
    error: err
  });
});

// Servidor escuchando dirección y puertos correspondientes
app.listen(app.get('port'), app.get('ip'), function() {
  console.log('Aplicación escuchando peticiones para la dirección ' + app.get('ip') +
    ' en el puerto ' + app.get('port') + " ...");
});

module.exports = app;
