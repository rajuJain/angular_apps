/**
 * userModel.js
 */

var moment	 = require( 'moment' );
var async	 = require( 'async' );
var crypto 	 = require( 'crypto' );
var common   = require( './common.js' );
var utils    = require( '../utils' );
var config 	 = require( '../config.json' );
var errors 	 = require( '../errors.json' ); 

var User     = require('../models').Users;

module.exports = {
/**
* Srv : userSignin
*
* login user in database
* 
* @param email 		 required String
* @param password	 required String
* @param device_id	 required Mixed
* @return {JSON string}
*/
  userSignin : function ( req, res){
		//console.log(req.body.email);       
          
		if((req.body.email.trim() == '' || req.body.email == undefined) || (req.body.password == '' || req.body.password == undefined)) {
			var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
			utils.badrequest( res, errObj, true );
			return;
		}		
		common.clearDeviceToken(req.body.deviceid, function(isExists){
			User.
			findOne({ where: {'username': common.encrypt(req.body.email, config.dbSecretKey), 'userStatus': 'A', 'passwd' : crypto.createHash('sha256').update(req.body.password).digest('base64'), isPatient: true}}).			
			then( function (userObj){				
				if(userObj!= null ) {	
					var sso_token = utils.uid( 32 );					
					var updateObj = {
						deviceId		: (req.body.deviceid != undefined) ? req.body.deviceid: userObj.deviceid,
						deviceType		: (req.body.devicetype != undefined) ? req.body.devicetype: userObj.deviceType,
						ssoToken		: sso_token
					};
					
					User.update(updateObj , {"where" : {id: userObj.dataValues.id}} ).then(function(u) {
						common.getAllEncryptDecryptDatabaseData(userObj.dataValues, config.dbSecretKey,'decrypt', function (encoded) {	
						   common.getAllEncryptDecryptClientData(encoded, sso_token,'encrypt', function (usrDeObj) {	
							var outputResult = {'id': usrDeObj.id, 'username': usrDeObj.username, 'firstName': usrDeObj.firstName, 'lastName': usrDeObj.lastName, 'gender': usrDeObj.gender, 'isPatient':userObj.isPatient,'thirdPartyToken':userObj.thirdPartyToken};
						
						res.json({result : outputResult, sso_token : sso_token, response_code : '200'});																		   						
						  });
						});
						
					});
					
				} else {
					var errObj = { error_code: errors.INVALIDUSER.code, error_text:  errors.INVALIDUSER.text }
					utils.badrequest( res, errObj, true );
					return;
				}
			});
		});

	},
	/**
	* Srv : logout
	*
	* Destroy user token
	* 
	* @param token required String
	* @param user_id required String
	* @return {JSON string}
	* @api only for authorized header
	*/
	logout : function ( req, res){
	
		var updateObj = {
			sso_token		: ''
		};
		
		User.update(updateObj , {"where" : { ssoToken: req.param('token') }} ).then(function(u) {
			res.json({result:'success', response_code : '200'});
		});
						
	},
	/**
	* Srv : getUserDetail
	*
	* Get user profile data
	* 
	* @param token required String
	* @param user_id required String
	* @return {JSON string}
	* @api only for authorized header
	*/
	getUserDetail : function ( req, res){
		if(req.param('user_id') == '' || req.param('user_id') == undefined) {
			var errObj = { error_code: errors.USERIDREQUIRED.code, error_text:  errors.USERIDREQUIRED.text };
			utils.badrequest( res, errObj, true );
			return;
		}		
		var user_id = common.resDecrypt(common.resEncrypt(1,req.param('token')), req.param('token'), false);		
		if(user_id == '') {
			var errObj = { error_code: errors.USERIDREQUIRED.code, error_text:  "Invalid user_id." };
			utils.badrequest( res, errObj, true );
			return;
		}
		User.	
		findOne({where:{ 'id' : user_id}}).
		then( function ( userObj ){
			if(userObj === null ) {			
				var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text  };
				utils.badrequest( res, errObj, true ); 
				return;
			}			
			var sso_token = req.param('token');
			common.getAllEncryptDecryptDatabaseData(userObj.dataValues, config.dbSecretKey,'decrypt', function (encoded) {	
			   common.getAllEncryptDecryptClientData(encoded, sso_token,'encrypt', function (usrDeObj) {	
				var outputResult = {'id': usrDeObj.id, 'username': usrDeObj.username, 'firstName': usrDeObj.firstName, 'lastName': usrDeObj.lastName, 'gender': usrDeObj.gender, 'isPatient':userObj.isPatient,'thirdPartyToken':userObj.thirdPartyToken};
			
			res.json({result : outputResult, sso_token : sso_token, response_code : '200'});																		   						
			  });
			});
		});	
	}
};
 
 