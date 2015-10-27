'use strict';

/**
 *
 * @ngdoc service
 * @name AngularDemo.service:serviceAuth
 * @description Auth service to provide all authentication related functionality.
 */
var moduleDependencies = ['ng'];
var providerDependencies = '';
try {
  var m = angular.module("ngApiGateWay");
  if(m){
	moduleDependencies = ['ng'];
	providerDependencies = 'serviceData';
  }
} catch(err) { /* failed to require */ }

angular.module('ngAuth', moduleDependencies)
.provider('serviceAuth', function () {
  
  //Private objects
  
  var AUTH_EVENTS =  {
	  loginSuccess: 'auth-login-success',
	  loginFailed: 'Bad Credentials',
	  logoutSuccess: 'auth-logout-success',
	  sessionTimeout: 'auth-session-timeout',
	  notAuthenticated: 'auth-not-authenticated',
	  notAuthorized: 'auth-not-authorized'
  };
  
  var authUrl = '';
  var authHeaders = {};
  var setAuthToken = false;
  var authTokenNode = null;
  
  this.setAuthData = function(authData){	
	  authUrl = authData.authUrl;
	  authHeaders = authData.headers ? authData.headers : {};
	  setAuthToken = authData.setAuthToken;
	  authTokenNode = authData.tokenNode;
  }
  
  this.$get = ['$location', '$route', '$q', '$http', providerDependencies, function ($location, $route, $q, $http, serviceData) {
	
	/**
     * @ngdoc
     * @name AngularDemo.service:serviceAuth#setStorage
     * @methodOf AngularDemo.service:serviceAuth
     * @public
     * @param {key, value} key and value to set as storage.
     * @description Set storage of logged in user.
     */
	var setStorage = function(key, value){
		if (angular.isObject(value)) {
		  value = JSON.stringify(value);
		}
		localStorage.setItem(key, value);
	}
	
	/**
	  * @ngdoc
	  * @name AngularDemo.service:serviceAuth#getStorage
	  * @methodOf AngularDemo.service:serviceAuth
	  * @public
      * @param {key} key to get storage value.
      * @description get storage of logged in user.
    */
	var getStorage = function(key){
		var data = localStorage.getItem(key);
		if (data) {
			return JSON.parse(data);
		}
		return false;
	}
	
	/**
	  * @ngdoc
	  * @name AngularDemo.service:serviceAuth#deleteStorage
	  * @methodOf AngularDemo.service:serviceAuth
	  * @public
      * @param {key} key to remove storage value.
      * @description remove storage of logged in user.
    */
	var deleteStorage = function(key){
	  if (key) {
		localStorage.removeItem(key);
	  }		
	}
	
    //Create a fresh or reintialized last created session.
    var session = (getStorage('session')) ? getStorage('session') : {};
    
    /**
     * @ngdoc
     * @name AngularDemo.service:serviceAuth#setSession
     * @methodOf AngularDemo.service:serviceAuth
     * @public
     * @param {userData} userData Object to set as session.
     * @description Set session of logged in user.
     */
      
      var setSession = function(userData){
	  //serviceData.logData('Session created for ' + JSON.stringify(userData));
		//if(userData.Status === 200){
		  session = {};
		  session = userData;
		  setStorage('session', JSON.stringify(session));
		//}
      return session;
    };
      
    /**
     * @ngdoc
     * @name AngularDemo.service:serviceAuth#getSession
     * @public
     * @methodOf AngularDemo.service:serviceAuth
     * @description Return logged in user session.
     */
    
      var getSession = function () {
      	 session = (getStorage('session')) ? getStorage('session') : {};
              if (!angular.isObject(session) && session.length > 0) {
                  session = JSON.parse(session)
              }
		  if (!angular.equals({}, session) && setAuthToken && serviceData) {
			  serviceData.config.currentEnvironment.serverTokenValue = session[authTokenNode];
		  }
      	 return session;
      };
      
    /**
     * @ngdoc
     * @name AngularDemo.service:serviceAuth#destroySession
     * @public
     * @methodOf AngularDemo.service:serviceAuth
     * @description Reset lodded in user session.
     */  
      
      var destroySession = function(){
	      session = {};
		  deleteStorage('session');
	      return session;
      };
      
      /**
     * @ngdoc
     * @methodOf AngularDemo.service:serviceAuth
     * @name AngularDemo.service:serviceData#login
     * @public
     * @param {obj} credentials obj for login
     *
     * #Allowable options:
     *
     * @description
     *
     * Validate user on basis of eenterd credential and create a session of unique data, get from token server.
     *
     * @returns {Promise} $q promise
     */
      
      var login = function (dataObj) {
		  var deferred = $q.defer();
	      var promise = deferred.promise;
		  if (!authUrl) {
			return deferred.reject({ data: 'Please set auth url!'});
		  }
	      if(!dataObj) {
	          return deferred.reject({ data: 'Please enter username & password'});
	      }  
		  
		   var sendConfig = {
			method : 'POST',
			url: authUrl,
			data: dataObj,
			headers : authHeaders
		  };
		  $http(sendConfig).success(function(data, status) {
			  if(!data.error_code && data.response_code == 200){
				  setSession(data.result);
				if (!angular.equals({}, data) && setAuthToken && serviceData) {
					serviceData.config.currentEnvironment.serverTokenValue = data.result[authTokenNode];
				}
			  }
			  deferred.resolve(data);
		  }).error(function(data, status) {
			  deferred.reject(data);
		  });
		  return promise;
      };
      
      // @private Auto login user from last saved storage 
      var autoLogin = function(){
	    setSession(getSession('session'));
	    return session;
      };
      
      // @private Check whther user is logged in or not
      var isAuthenticated = function () {
	  var session = this.getSession();
		if (!angular.equals({}, session)) {
			return !!session;
		}else{
			return false;    
		}
      };
      
      // @private return user roles which are autorized for requested location
      var getAuthorizedRoles = function(){
	      
	      var path = $location.path(),
	      authorizedRoles = [];
	      angular.forEach($route.routes, function (value, key) {
		  if (key && value.data) {
			  if(key == path && value.data) {
				  authorizedRoles = value.data.authorizedRoles;
			  }	
		  }		      
	      });
	      return authorizedRoles;        
      };
      
      
      // Check whther user is authorized to access request location
      var isAuthorized = function () {
	      autoLogin();
	      var authorizedRoles = getAuthorizedRoles();
	      if (!angular.isArray(authorizedRoles)) {
		       authorizedRoles = [authorizedRoles];
	      }	      
	      return (this.isAuthenticated() && authorizedRoles.indexOf(session.group) !== -1);
      };
      
      var logout = function(){
		  session = {};
		  if (setAuthToken && serviceData) {
			  serviceData.config.currentEnvironment.serverTokenValue = null;
		  }
		  deleteStorage('session');
		  return session;
      };
    
    return {
      getSession : getSession,
      setSession : setSession,
      login : login,
      isAuthorized: isAuthorized,
      isAuthenticated : isAuthenticated,
      logout : logout
      
    };
  }];
});