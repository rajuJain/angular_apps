/**
 * API routes
 */
var nodemailer 	= require( 'nodemailer' );
var errors 	 = require( '../errors.json' );
var config 	 = require( '../config.json' );
var adminModel   = require( '../includes/adminModel.js' );
/**
* Srv : index
*/
exports.index = function ( req, res, next ){	
	
	res.json({result:"Success", response_code : '200'}); 
};
/**
* Srv : userSignin
* User authentication function
*/
exports.userSignin = function ( req, res, next ){
	adminModel.userSignin(req, res);
};
/**
* Srv : addProvider
* Create provider function
*/
exports.addProvider = function ( req, res, next ){
	adminModel.addAdminUser(req, res, 'Provider');
};

/**
* Srv : updateProvider
* Update provider function
*/
exports.updateProvider = function ( req, res, next ){
	adminModel.updateAdminUser(req, res, 'Provider');
};

/**
* Srv : providerList
* Provider List function
*/
exports.providerList = function ( req, res, next ){
	adminModel.userList(req, res, 'Provider');
};


/**
* Srv : addPatient
* Create Patient function
*/
exports.addPatient = function ( req, res, next ){
	adminModel.addAdminUser(req, res, 'Patient');
};


/**
* Srv : updatePatient
* Update Patient function
*/
exports.updatePatient = function ( req, res, next ){
	adminModel.updateAdminUser(req, res, 'Patient');
};

/**
* Srv : patientList
* patient List function
*/
exports.patientList = function ( req, res, next ){
	adminModel.userList(req, res, 'Patient');
};


/**
* Srv : orgProviderList
* provider List function for a particular organization
*/
exports.orgProviderList = function ( req, res, next ){
	adminModel.orgProviderList(req, res);
};


/**
* Srv : addAdmin
* Create Admin function
*/
exports.addAdmin = function ( req, res, next ){
	adminModel.addAdminUser(req, res, 'Admin');
};


/**
* Srv : updateAdmin
* Update Admin function
*/
exports.updateAdmin = function ( req, res, next ){
	adminModel.updateAdminUser(req, res, 'Admin');
};

/**
* Srv : adminList
* Admin List function
*/
exports.adminList = function ( req, res, next ){
	adminModel.userList(req, res, 'Admin');
};


/**
* Srv : updatePassword
* updatePassword function
*/
exports.updatePassword = function ( req, res, next ){
	adminModel.updatePassword(req, res);
};


/**
* Srv : logout
* Destroy user token
*/
exports.logout = function ( req, res, next ){
	adminModel.logout(req, res);		
};










