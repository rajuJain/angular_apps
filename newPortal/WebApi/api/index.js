/**
 * API routes
 */
var nodemailer 	= require( 'nodemailer' );
var errors 	 = require( '../errors.json' );
var config 	 = require( '../config.json' );
var userModel   = require( '../includes/userModel.js' );
/**
* Srv : index
*/
exports.index = function ( req, res, next ){	
	
	res.json({result:{'encrypt': "", 'decrypt': ""}, response_code : '200'}); 
};
/**
* Srv : userSignin
* User authentication function
*/
exports.userSignin = function ( req, res, next ){
	userModel.userSignin(req, res);
};
/**
* Srv : logout
* Destroy user token
*/
exports.logout = function ( req, res, next ){
	userModel.logout(req, res);		
};
/**
* Srv : getUserDetail
* Get user profile data
*/
exports.getUserDetail = function ( req, res, next ){
	userModel.getUserDetail(req, res);
};









