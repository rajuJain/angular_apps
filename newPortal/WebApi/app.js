/**
 * app.js
 */

var http    = require( 'http' );
var path    = require( 'path' );
var url	    = require( 'url' );
var express = require( 'express' );
var engine  = require( 'ejs-locals' );

var api  	= require( './api' );
var admin  	= require( './admin' );
//var cron  	= require( './cron' );
var config 	= require( './config.json' );
var common  = require( './includes/common.js' );

var app     = express();

// all environments
app.set( 'port', process.env.PORT || 8080 );
app.engine( 'ejs', engine );
app.set( 'views', path.join( __dirname, 'views' ));
app.set( 'view engine', 'ejs' );

app.use( express.favicon());
app.use( express.logger( 'dev' ));
//app.use( express.cookieParser());
//app.use( express.bodyParser());
app.use( express.json());
app.use( express.urlencoded());
app.use( express.methodOverride());
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Content-Type, apikey, token, adminkey, admintoken');	
    next();
};
app.use(allowCrossDomain);
app.use( app.router );
app.use( express.static( path.join( __dirname, 'public' )));

// development only
if( 'development' == app.get( 'env' )){
  app.use( express.errorHandler());
}



app.all('/api/*', function(req, res, next){
   var pathname = url.parse(req.url).pathname;  	
   var apikey = '';

  if(req.param('apikey') !== '' && req.param('apikey') !== undefined)  {
	apikey = req.param('apikey');
  }else if (!apikey && req.headers.apikey) {
    apikey = req.headers.apikey;
  }
  if(apikey !== config.APIKEY) {
	res.statusCode = 201;
	res.json({error_code: 'IN0024', error_text : 'Invalid API key'});
  }	else {
	 if(pathname == '/api/' || pathname == '/api/signup' || pathname == '/api/signin' || pathname == '/api/forgot') {
		next();
	 } else { 
		common.verifyToken(res, req.param('token'), true, next);    
	 }
  };
});
/* This section admin section */
app.all('/admin/*', function(req, res, next){
   var pathname = url.parse(req.url).pathname;  	
   var apikey = '';

  if(req.param('adminkey') !== '' && req.param('adminkey') !== undefined)  {
	apikey = req.param('adminkey');
  }else if (!apikey && req.headers.adminkey) {
    apikey = req.headers.adminkey;
  } 
  if(apikey !== config.ADMINKEY) {
	res.statusCode = 201;
	res.json({error_code: 'IN0024', error_text : 'Invalid API key'});
  }	else {
	 if(pathname == '/admin/signin') {
		next();
	 } else { 
		common.verifyToken(res, req.param('admintoken'), false, next);    
	 }
  };
});
//End
app.all('/cron/*', function(req, res, next){
  var cronkey = '';
  if(req.param('cronkey') !== '' && req.param('cronkey') !== undefined)  {
	console.log("1 "+req.param('cronkey'));
	cronkey = req.param('cronkey');
  }

  console.log("3 "+cronkey);
  if(cronkey !== config.CRONKEY) {
		res.statusCode = 201;
		res.end('Invalid Cron key');
  }	else {
    next();
  };
});

// API Routes
app.get( '/api', api.index ); // for test
app.get( '/api/getUserDetail', api.getUserDetail ); // for getting user detail
app.get( '/api/logout', api.logout ); // destroy user token

app.post( '/api/signin', api.userSignin ); // user login token

// ADMIN Routes
app.get( '/admin', admin.index ); // for test
app.get( '/admin/logout', admin.logout ); // destroy user token

app.post( '/admin/signin', admin.userSignin ); // user login token

app.post( '/admin/addAdmin', admin.addAdmin); // add Admin
app.post( '/admin/AdminList', admin.adminList); // Admin list
app.post( '/admin/updateAdmin', admin.updateAdmin); // update Admin

app.post( '/admin/addProvider', admin.addProvider ); // add provider
app.post( '/admin/providerList', admin.providerList ); // provider list
app.post( '/admin/updateProvider', admin.updateProvider ); // update provider

app.post( '/admin/addPatient', admin.addPatient ); // add patient
app.post( '/admin/patientList', admin.patientList ); // patient list
app.post( '/admin/updatePatient', admin.updatePatient ); // update patient
app.post( '/admin/orgProviderList', admin.orgProviderList ); // org provider List


app.post( '/admin/updatePassword', admin.updatePassword ); // updatePassword

//Cron Routes
//app.get( '/cron/checkUser', cron.checkUser ); // cron for checking user status

http.createServer( app ).listen( app.get( 'port' ), function (){
  console.log( 'Server listening on port ' + app.get( 'port' ));
});
