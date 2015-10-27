/**
 * common.js
 */

var moment	 = require( 'moment' );
var async	 = require( 'async' );
var crypto 	 = require( 'crypto' );
//var agent 	 = require('./apn'); 
var CryptoJS = require('node-cryptojs-aes').CryptoJS;
var utils    = require( '../utils' );
var config 	 = require( '../config.json' );
var errors 	 = require( '../errors.json' ); 

var User     = require('../models').Users;
var https = require('http');


module.exports = {
  verifyToken : function ( res, token, role, next ){
	if(token == '' || token == undefined) {
		var errObj = { error_code: errors.TOKENREQUIRED.code, error_text:  errors.TOKENREQUIRED.text };
		utils.badrequest( res, errObj, true );
		return;
	}
	
	User.
    findOne({where:{'ssoToken' : token, isPatient: role }}).		
    then( function (userObj){       
		if(userObj == null)	{
			var errObj = {error_code: '300', error_text : 'Login token has expired. Please login again.'};
			utils.badrequest( res, errObj, true ); 
			return;
		} else {
			next();
		}
	});
	
  },  
  sendPushNotification : function (user_id, message, action_type) {
	
	if(user_id != '') {	
		User.
		findOne({where:{ 'id' : user_id }}).		
		then( function ( userObj ){
			/*if( err ) { 
				console.log(err);				
				return;
			}*/
			//console.log("device - "+userObj.device_id);
			action_type = (action_type==17)?12:action_type;
			if(userObj.device_id != null && userObj.device_id != undefined)	{
				agent.createMessage()
				  .device(userObj.device_id)
				  .set('id', action_type) 
				  .alert(message)
				  .expires('12h')
				  .send();
				  console.log('Push notification sent.');
			}
			
		});
	
	}
  },  
  encrypt: function (input, password) {
	try{
		input = input.toString();
		var m = crypto.createHash('md5');
		m.update(password);
		var key = m.digest('hex');
	
		m = crypto.createHash('md5');
		m.update(password + key);
		var iv = m.digest('hex');
	
		var data = new Buffer(input, 'utf8').toString('binary');
	
		var cipher = crypto.createCipheriv('aes-256-cbc', key, iv.slice(0,16));
		var encrypted = cipher.update(data, 'utf8', 'binary') + cipher.final('binary');
		var encoded = new Buffer(encrypted, 'binary').toString('base64');
	
		return encoded;
	}catch (ex) {
	 	return input;
	}
 },
 decrypt: function (input, password) {
	 try{
		// Convert urlsafe base64 to normal base64
		var input = input.replace(/\-/g, '+').replace(/_/g, '/');
		// Convert from base64 to binary string
		var edata = new Buffer(input, 'base64').toString('binary');
	
		// Create key from password
		var m = crypto.createHash('md5');
		m.update(password);
		var key = m.digest('hex');
	
		// Create iv from password and key
		m = crypto.createHash('md5');
		m.update(password + key);
		var iv = m.digest('hex');
	
		// Decipher encrypted data
		var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv.slice(0,16));
		var decrypted = decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8');  
		var plaintext = new Buffer(decrypted, 'binary').toString('utf8');
		return plaintext;
	 }catch (ex) {
		 return input;
	 }
  },
  resEncrypt: function (input, password, isDatabase) {
	try{
		if (input == password) {
		  return input;	
		}
		input = input.toString();
		if(isDatabase!=undefined && isDatabase){
			input = this.decrypt(input, config.dbSecretKey);			
		}		
		var encoded = CryptoJS.AES.encrypt(input, password).toString();
		return encoded;
	}catch (ex) {
	 return input;
	}
  },
  resDecrypt: function (input, password, isDatabase) {
	try{
		if (input == password) {
		  return input;	
		}
		var decrypted = CryptoJS.AES.decrypt(input, password);
    	var plaintext = CryptoJS.enc.Utf8.stringify(decrypted);	
		
		if(isDatabase!=undefined && isDatabase){
			plaintext = this.encrypt(plaintext, config.dbSecretKey);
		}
		return plaintext;	
	}catch (ex) {		
	 return input;
	}
  },
  getAllEncryptDecryptDatabaseData: function (jsonArray, clientKey, type, callback) {
	  me= this;
	if(jsonArray instanceof Object){
	  var retConvertArr = {};
	  var loopIter = 1;
	  var len = Object.keys(jsonArray).length;
	 
	  for(var i in jsonArray){
		(function(d) {	
			retConvertArr[d] = (type=='encrypt')? me.encrypt(jsonArray[d], clientKey): me.decrypt(jsonArray[d], clientKey);			
			
			if(loopIter == len){
				callback(retConvertArr);
			}else{
			  loopIter++;
			}
		  }(i));
	  }
	}else if (jsonArray instanceof Array) {
	  var retConvertArr = {};
	  var len = Object.keys(jsonArray).length;
	  for(i= 0; i < len; i++){
		(function(d) {	
			retConvertArr[d] = (type=='encrypt')?me.encrypt(jsonArray[d], clientKey):me.decrypt(jsonArray[d], clientKey);
			if(d == (len - 1)){
				callback(retConvertArr);
			}
		  }(i));
	  }
	}else if (jsonArray instanceof String) {
	  retConvertArr = (type=='encrypt')?me.encrypt(jsonArray, clientKey):me.decrypt(jsonArray, clientKey);
	  callback(retConvertArr);
	}else{
	  callback(jsonArray);
	}
  },
  getAllEncryptDecryptClientData: function (jsonArray, clientKey, type, callback) {
	  me = this;
	if(jsonArray instanceof Object){
	  var retConvertArr = {};
	  var loopIter = 1;
	  var len = Object.keys(jsonArray).length;
	  for(var i in jsonArray){
		(function(d) {	
			retConvertArr[d] = (type=='encrypt')?me.resEncrypt(jsonArray[d], clientKey):me.resDecrypt(jsonArray[d], clientKey);
			if(loopIter == len){
			  callback(retConvertArr);
			}else{
			  loopIter++;
			}
		  }(i));
	  }
	}else if (jsonArray instanceof Array) {
	  var retConvertArr = {};
	   var len = Object.keys(jsonArray).length;
	  for(i= 0; i < len; i++){
		(function(d) {	
			retConvertArr[d] = (type=='encrypt')?me.resEncrypt(jsonArray[d], clientKey):me.resDecrypt(jsonArray[d], clientKey);
			if(d == (len - 1)){
				callback(retConvertArr);
			}
		  }(i));
	  }
	}else if (jsonArray instanceof String) {
	  retConvertArr = (type=='encrypt')?me.resEncrypt(jsonArray, clientKey):me.resDecrypt(jsonArray, clientKey);
	  callback(retConvertArr);
	}else{
	  callback(jsonArray);
	}	
  },
  clearDeviceToken: function(device_id, cb){
		if(device_id != undefined){
			
		  User.update({deviceId:""} , {"where" : {deviceId: device_id}} ).then(function() {
		  	cb(true);
		  });

		}else{
			cb(false);
		}
	}

 };
 
 