/**
 * adminModel.js
 */

var moment	 = require( 'moment' );
var async	 = require( 'async' );
var crypto 	 = require( 'crypto' );
var common   = require( './common.js' );
var utils    = require( '../utils' );
var config 	 = require( '../config.json' );
var errors 	 = require( '../errors.json' ); 

var User     = require('../models').Users;
var OrgUsers = require('../models').OrgUsers;
var MyProviders = require('../models').MyProviders;
var Patients = require('../models').Patients;
var Orgs = require('../models').Orgs;

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
		  //console.log(common.encrypt('Phoenix', config.dbSecretKey));
            if((req.body.email.trim() == '' || req.body.email == undefined) || (req.body.password == '' || req.body.password == undefined)) {
                var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                utils.badrequest( res, errObj, true );
                return;
            }		
            common.clearDeviceToken(req.body.deviceid, function(isExists){
                  User.
                  findOne({where: {'username': common.encrypt(req.body.email, config.dbSecretKey), 'userStatus': 'A', 'passwd' : crypto.createHash('sha256').update(req.body.password).digest('base64'), isPatient: false  }}).			
                  then( function (userObj){				
                      if(userObj!= null ) {	
                          var sso_token = utils.uid( 32 );					
                          var updateObj = {
                              deviceId		: (req.body.deviceid != undefined) ? req.body.deviceid: userObj.deviceid,
                              deviceType	: (req.body.devicetype != undefined) ? req.body.devicetype: userObj.deviceType,
                              ssoToken		: sso_token
                          };
                          
                          User.update(updateObj , {"where" : {id: userObj.dataValues.id}} ).then(function(u) {																														  							 OrgUsers.
							  findOne({attributes:['orgId', 'orgRole', 'location'], where: {'userId': userObj.dataValues.id}}).			
							  then( function (OrgObj){									  
								  if(OrgObj==null){
									orgData = {orgId:null, orgRole: null, location: null}; 
								  }else{
									  var orgVal = OrgObj.dataValues;
									  var orgData = {orgId:common.resEncrypt(orgVal.orgId, sso_token, true), orgRole: common.resEncrypt(orgVal.orgRole, sso_token, true), location: common.resEncrypt(orgVal.location, sso_token, true)};
									  
								  }
								  common.getAllEncryptDecryptDatabaseData(userObj.dataValues, config.dbSecretKey,'decrypt', function (encoded) {	
									 common.getAllEncryptDecryptClientData(encoded, sso_token,'encrypt', function (usrDeObj) {	
									  var outputResult = {'id': usrDeObj.id, 'username': usrDeObj.username, 'firstName': usrDeObj.firstName, 'lastName': usrDeObj.lastName, 'gender': usrDeObj.gender, 'isPatient':userObj.isPatient,'thirdPartyToken':userObj.thirdPartyToken, orgId: orgData.orgId, orgRole: orgData.orgRole, location: orgData.location};
								  res.json({result : outputResult, sso_token : sso_token, response_code : '200'});																		   								   });
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
      * Srv : addAdminUser
      * Create user in database
      * @param email 		 required String
      * @param password	 required String
      * @return {JSON string}
      */
      
      addAdminUser: function ( req, res, type){
		 // console.log(common.resEncrypt('provider2@gate6.com', req.param('admintoken')));
		   var me  = this;
          	if((req.body.email.trim() == '' || req.body.email == undefined) || (req.body.password == '' || req.body.password == undefined) || (req.body.orgId == '' || req.body.orgId == undefined)) {
                  var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                  utils.badrequest( res, errObj, true );
                  return;
            }
            
            //console.log(req.body);
            common.getAllEncryptDecryptClientData(req.body, req.param('admintoken'),'decrypt', function (bodyObj) {
                  common.getAllEncryptDecryptDatabaseData(bodyObj, config.dbSecretKey,'encrypt', function (paramObj) {	
					Orgs.
                      findOne({ where: {id: bodyObj.orgId, status:'A'} }).
                      then( function (orgObj){			
						  if(orgObj == null) {				
							  var errObj = { error_code: errors.INVALIDORG.code, error_text:  errors.INVALIDORG.text };
							  utils.badrequest( res, errObj, true );
							  return;
						  }
						  User.
						  findOne({ where: {username: paramObj.email} }).
						  then( function (userObj){					
							  if(userObj != null) {				
								  var errObj = { error_code: errors.EMAILEXIST.code, error_text:  errors.EMAILEXIST.text };
								  utils.badrequest( res, errObj, true );
								  return;
							  } else {
								  var insertObj = {
									username        : paramObj.email,
									firstName       : paramObj.firstName,
									lastName        : paramObj.lastName,
									userStatus      : 'I',
									gender          : paramObj.gender,
									passwd          : crypto.createHash('sha256').update(bodyObj.password).digest('base64'),
									deviceType      : 'A',
									isPatient       : (type=='Patient')?1:0,
									verification    : utils.uid( 32 )
									
								  };
								  //Insert Code for user
								  User.
								  create(insertObj).
								  then( function (insertResponse){					
									me.setUserRole(insertResponse, bodyObj, paramObj, type, function (response) {
										//Add Email User to activate account Here
										res.json({result:'success', response_code : '200'});																															 									});
								  });								  
							  }
						  });
					  });  
                  });
            });
      },  
	  setUserRole: function (userObj, paramObj, dbparamObj, type, callback) {
		  if(type=='Patient'){
			  //Patient insertion block
			  var insertObj = {
				userId        : userObj.dataValues.id,
				orgId	      : paramObj.orgId,
				status		  : 'A',
				isValidated   : 1				
			  };
			  //Insert Code for patient
			  Patients.
			  create(insertObj).
			  then( function (insertResponse){				
				  if(paramObj.providerId ==undefined || paramObj.providerId ==''){
				    callback(true);
				  }else{
		 			OrgUsers.
					  findOne({where: {'id': paramObj.providerId, status: 'A', orgRole: 'Provider'}}).			
					  then( function (OrgObj){									  
					  if(OrgObj==null){
						  callback(false);
					  }
					  var insertObj = {
						userId        : userObj.dataValues.id,
						providerId    : paramObj.providerId							
					  };
					  //Insert Code for my provider
					  MyProviders.
					  create(insertObj).
					  then( function (insertResponse){
						callback(true);
					  });
					});				 
				  }
			  }); 
		  }else{
			 //Organization insertion block
			  var insertObj = {
				userId        : userObj.dataValues.id,
				orgId	      : paramObj.orgId,
				status		  : 'A',
				orgRole		  : type,
				location	  : dbparamObj.location
			  };
			  //Insert Code for provider/org users
			  OrgUsers.
			  create(insertObj).
			  then( function (insertResponse){
				callback(true);
			  });			 
		  }
	  },
      /**
      * Srv : addAdminUser
      * Create user in database
      * @param email 		 required String
      * @param userId	 required int
      * @return {JSON string}
      */
      
      updateAdminUser: function ( req, res, type){
            if(!req.body.userId && !req.body.email) {
                  var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                  utils.badrequest( res, errObj, true );
                  return;
            }
            
            //console.log(req.body);
            common.getAllEncryptDecryptClientData(req.body, req.param('admintoken'),'decrypt', function (bodyObj) {
                  User.
                  findOne({ where: {'id': bodyObj.userId}}).			
                  then( function (userObj){
                        if(!userObj) {
                              var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                              utils.badrequest( res, errObj, true );
                              return;
                        }else{
                              common.getAllEncryptDecryptDatabaseData(bodyObj, config.dbSecretKey,'encrypt', function (paramObj) {																 
                              			
                                    var updateObj = {
                                      username        : paramObj.email ? paramObj.email : userObj.dataValues.username,
                                      firstName       : paramObj.firstName ? paramObj.firstName : userObj.dataValues.firstName,
                                      lastName        : paramObj.lastName ? paramObj.lastName : userObj.dataValues.lastName,
                                      userStatus      : bodyObj.userStatus ? bodyObj.userStatus : userObj.dataValues.userStatus,
                                      gender          : paramObj.gender ? paramObj.gender : userObj.dataValues.gender
                                    };
                                    
                                    if (paramObj.email && paramObj.email != userObj.dataValues.username) {
                                          User.
                                          findOne({ where: {username: paramObj.email} }).
                                          then( function (existingUserObj){
                                                if(existingUserObj != null) {				
                                                      var errObj = { error_code: errors.EMAILEXIST.code, error_text:  errors.EMAILEXIST.text };
                                                      utils.badrequest( res, errObj, true );
                                                      return;
                                                } else {
                                                      //Update Code for user
                                                      User.update(updateObj , {"where" : {id: userObj.dataValues.id}} ).then(function(u) {		
                                                           res.json({result:'success', response_code : '200'});
                                                      });  
                                                }
                                          });      
                                    }else{
                                          //Update Code for user
                                          User.update(updateObj , {"where" : {id: userObj.dataValues.id}} ).then(function(u) {		
                                               res.json({result:'success', response_code : '200'});
                                         });      
                                    }
                               });
                        }
                        
                        
                  });
                  
            });
      },
            
      /**
      * Srv : userList
      * Provide user list from database
      * @return {JSON string}
      */
      userList: function ( req, res, type){
                  
            if(!req.body.take || !req.body.skip) {
                  var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                  utils.badrequest( res, errObj, true );
                  return;
            }
            common.getAllEncryptDecryptClientData(req.body, req.param('admintoken'),'decrypt', function (bodyObj) {
                  if (type=='Patient') {                  
                        Patients.
                        findAll({attributes: ['userId'], include: [{attributes: ['id', 'username', 'firstName', 'lastName', 'userStatus', 'gender'], model: User, required: true}], where: {orgId : bodyObj.orgId},limit: bodyObj.take, offset: bodyObj.skip}).
                        then( function (users){
                              if (users.length > 0) {                        
                                    var userList = [];
                                    for(var i = 0; i < users.length; i++){
                                          (function(index){
                                                common.getAllEncryptDecryptDatabaseData(users[index].dataValues.User.dataValues, config.dbSecretKey,'decrypt', function (usrObj) {
                                                      usrObj.userStatus = users[index].dataValues.User.dataValues.userStatus;
                                                      common.getAllEncryptDecryptClientData(usrObj, req.param('admintoken'),'encrypt', function (encryptedUser) {
                                                            userList[index] = encryptedUser;
                                                            if (index == (users.length - 1)) {
                                                                  res.json({response_code : '200', result : userList});
                                                            }
                                                      });
                                                });
                                          }(i));
                                    }
                              }else{
                                    res.json({response_code : '200', result : [], message : 'No records found.'});
                              }
                        });
                  }else{
                        OrgUsers.
                        findAll({attributes: ['userId', 'location'], include: [{attributes: ['id', 'username', 'firstName', 'lastName', 'userStatus', 'gender'], model: User, required: true}], where: {orgRole: type, orgId : bodyObj.orgId}}).
                        then( function (providers){
                              if (providers.length > 0) {                        
                                    var providerList = [];
                                    for(var i = 0; i < providers.length; i++){
                                          (function(index){
                                                common.getAllEncryptDecryptDatabaseData(providers[index].dataValues.User.dataValues, config.dbSecretKey,'decrypt', function (usrObj) {
                                                      usrObj.userStatus = providers[index].dataValues.User.dataValues.userStatus;
                                                      common.getAllEncryptDecryptClientData(usrObj, req.param('admintoken'),'encrypt', function (encryptedUser) {
                                                            providerList[index] = encryptedUser;
                                                            if (index == (providers.length - 1)) {
                                                                  res.json({response_code : '200', result : providerList});
                                                            }
                                                      });
                                                });
                                          }(i));
                                    }
                              }else{
                                    res.json({response_code : '200', result : [], message : 'No records found.'});
                              }
                        });
                  }
            });
           
      },
      
      /**
      * Srv : orgProviderList
      * Provide Provider list of a particular organization from database
      * @param orgId 		 required Int
      * @return {JSON string}
      */
      orgProviderList: function (req, res){
                  
            if(!req.body.orgId) {
                  var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                  utils.badrequest( res, errObj, true );
                  return;
            }
            
            common.getAllEncryptDecryptClientData(req.body, req.param('admintoken'),'decrypt', function (bodyObj) {
                  OrgUsers.
                  findAll({attributes: ['userId', 'location'], include: [{attributes: ['firstName', 'lastName'], model: User, required: true}], where: {orgRole: 'Provider', orgId : bodyObj.orgId}}).
                  then( function (providers){
                        if (providers.length > 0) {                        
                              var providerList = [];
                              for(var i = 0; i < providers.length; i++){
                                    (function(index){
                                          var provider = {
                                                userId    : common.resEncrypt(providers[i].dataValues.userId,req.param('admintoken'), false),
                                                firstName : common.resEncrypt(providers[i].dataValues.User.dataValues.firstName, req.param('admintoken'), true),
                                                lastName  : common.resEncrypt(providers[i].dataValues.User.dataValues.lastName, req.param('admintoken'), true),
                                                location  : common.resEncrypt(providers[i].dataValues.location, req.param('admintoken'), true)
                                          };
                                          
                                          providerList[index] = provider;
                                          if (index == (providers.length - 1)) {
                                                res.json({response_code : '200', result : providerList});
                                          }
                                    }(i));
                              }
                        }else{
                              res.json({response_code : '200', result : [], message : 'No records found.'});
                        }
                  });
                 
            });
           
      },
      
      /**
      * Srv : updatePassword
      * Update Password of user
      * @param userId 		 required Int
      * @return {JSON string}
      */
      
      updatePassword: function ( req, res){
            if(!req.body.userId || !req.body.password || !req.body.oldPassword) {
                  var errObj = { error_code: errors.INVALID.code, error_text:  errors.INVALID.text };
                  utils.badrequest( res, errObj, true );
                  return;
            }
            
            //console.log(req.body);
            common.getAllEncryptDecryptClientData(req.body, req.param('admintoken'),'decrypt', function (bodyObj) {
                  User.
                  findOne({ where: {'id': bodyObj.userId, passwd : crypto.createHash('sha256').update(bodyObj.oldPassword).digest('base64')}}).			
                  then( function (userObj){
                        if(!userObj) {
                              var errObj = { error_code: errors.INVALID.code, error_text:  'Invalid Old Password.' };
                              utils.badrequest( res, errObj, true );
                              return;
                        }else{
                              common.getAllEncryptDecryptDatabaseData(bodyObj, config.dbSecretKey,'encrypt', function (paramObj) {																 
                              			
                                    var updateObj = {
                                      passwd : crypto.createHash('sha256').update(bodyObj.password).digest('base64'),
                                    };
                                    
                                    //Update Code for user password
                                    User.update(updateObj , {"where" : {id: userObj.dataValues.id}} ).then(function(u) {
                                         res.json({result:'success', response_code : '200'});
                                    });      
                                    
                               });
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
      
            var updateObj = {sso_token		: ''};
            
            User.update(updateObj , {"where" : { ssoToken: req.param('admintoken') }} ).then(function(u) {
                res.json({result:'success', response_code : '200'});
            });
      }	
};
 
 