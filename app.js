var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser('Quiz 2015'));
app.use(cookieParser('ipowQuizla2015')); // semilla para cifrar la cookie
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(partials());


// Helpers dinámicos para trabajo con sesión
app.use(function(req, res, next) {

	//1: guardar el path actual en sesión para poder redireccionar tras login o logout
	if (!req.path.match(/\/login|\/logout/)) {
		req.session.redir = req.path;
	}

	//2: auto-logout tras más de 2 minutos de inactividad
	if (req.session.user) {
		var d = new Date();
		var ahora = d.getTime();
		if (req.session.horaUltimoAcceso) {
			var inactividad = ahora-req.session.horaUltimoAcceso;
			if (inactividad > 120000) {
				delete req.session.user;
				delete req.session.horaUltimoAcceso;
				req.session.errors = [
					{   'message': 'Auto-logout ('+Math.round(inactividad/1000)+' segundos de inactividad)' }
				];
				res.redirect('/login');
				return;
			}
		}
		req.session.horaUltimoAcceso = ahora;
	}

	//3: pasar la sesión al res.locals para poderlo usar en las vistas
	res.locals.session = req.session;
	next();
});



app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
