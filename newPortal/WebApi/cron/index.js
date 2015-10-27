/**
 * Cron routes
 */
var math 	 = require( 'mathjs' ); 
var moment	 = require( 'moment' );
var async	 = require( 'async' );

var common   = require( '../includes/common.js' );
var utils    = require( '../utils' );
var errors 	 = require( '../errors.json' );
var config 	 = require( '../config.json' );

var User     = require('../models').user;
var UserSocialProfile = require('../models').user_social;

/**
* Cron : checkUser
*
* calculate checkUser
* @return {JSON string}
* @api only for authorized header
*/
exports.checkUser = function ( req, res, next ){
	res.json({'result' : 'OK'});				

};