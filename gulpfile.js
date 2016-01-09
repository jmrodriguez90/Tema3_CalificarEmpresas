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
var gulp = require('gulp');

var docco = require("gulp-docco");
var env = require('gulp-env');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var shell = require('gulp-shell');

var test = ['app.js', 'routes/*.js', 'lib/*.js'];
var all = ['app.js', 'routes/*.js', 'lib/*.js', 'test/test.js'];

var testing = false;

// Finaliza la ejecución una vez la tarea ha sido terminada
gulp.on('stop', function() {
  if (testing) {
    process.nextTick(function() {
      process.exit(0);
    });
  }
});

// Comprobación sintáctica del código
gulp.task('lint', function() {
  return gulp.src(all)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Ejecución de test de cobertura
gulp.task('pre-test', function() {
  return gulp.src(test)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

// Ejecución de test unitarios
gulp.task('test', ['lint', 'pre-test'], function() {
  testing = true;
  return gulp.src(['test/test.js'])
    .pipe(mocha())
    .pipe(istanbul.writeReports())
}, ['stop']);

// Genera documentación
gulp.task('doc', function() {
  return gulp.src(all)
    .pipe(docco())
    .pipe(gulp.dest('./doc'));
});

// Observa los archivos pendiente de cambios
gulp.task('watch', function() {
  gulp.watch(style, ['sass']);
  gulp.watch(main, ['build']);
});

// Tarea por defecto (métodos de generación)
gulp.task('default', ['doc']);

// Ejecuta la aplicación con nodemon en modo desarrollo
gulp.task('dev', ['default'], function() {
  nodemon({
      script: 'app',
      ext: 'js html',
      env: {
        'NODE_ENV': 'development',
        'PORT': 3000,
        'IP': '127.0.0.1'
      }
    })
    .on('restart', function() {
      console.log('Servidor reiniciado...')
    })
});

gulp.task('setProduction', function() {
  env({
    vars: {
      'NODE_ENV': 'production',
      'PORT': 5000
    }
  });
});

// Ejecuta la aplicación en modo producción
gulp.task('server', ['default', 'setProduction'], shell.task(['node app']));
