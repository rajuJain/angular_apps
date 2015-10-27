'use strict';

/**
 *
 * @ngdoc service
 * @name healthApp.service:serviceAuth
 * @description Auth service to provide all authentication related functionality.
 */

angular.module('patientPortalWorkList')
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
  
  
  this.$get = ['$location', '$q', '$cookies', 'config', 'serviceData', 'serviceGlobal',  function ($location, $q, $cookies,config, serviceData, serviceGlobal, serviceSync) {
    
    //Create a fresh or reintialized last created session.
        var session = $cookies.session || {};
    
    /**
     * @ngdoc
     * @name healthApp.service:serviceAuth#setSession
     * @methodOf healthApp.service:serviceAuth
     * @public
     * @param {userData} userData Object to set as session.
     * @description Set session of logged in user.
     */
      
      var setSession = function(userData){
		serviceData.logData('Session created for ' + JSON.stringify(userData));
        
		session = {};
		session.user_id = userData.id;
		session.firstName = userData.firstName;
		session.lastName = userData.lastName;
		session.username = userData.username;
		session.gender = userData.gender;
		session.sso_token = userData.sso_token;
		session.orgId = userData.orgId;
		session.orgRole = userData.orgRole;
		session.location = userData.location;
		session.Type = userData.orgRole;
		
		config.setToken(userData.sso_token);
		config.appointmentToken(userData.thirdPartyToken);
		console.log(session);
		$cookies.session = JSON.stringify(session);
		return session;
	  };
      
	  /**
	   * @ngdoc
	   * @name healthApp.service:serviceAuth#getSession
	   * @public
	   * @methodOf healthApp.service:serviceAuth
	   * @description Return logged in user session.
	   */
    
	  var getSession = function () {
		session = $cookies.session || {};
		if (!angular.isObject(session) && session.length > 0) {
		 return JSON.parse(session);
		} else {
			return session;
		}
      	 
      };
      
    /**
     * @ngdoc
     * @name healthApp.service:serviceAuth#destroySession
     * @public
     * @methodOf healthApp.service:serviceAuth
     * @description Reset lodded in user session.
     */  
      
      var destroySession = function(){
	      serviceData.logData('Session Destroyed');
	      session = {};
	      return session;
      };
      
     /**
     * @ngdoc
     * @methodOf healthApp.service:serviceAuth
     * @name healthApp.service:serviceData#login
     * @public
     * @param {string} username, username for login
     * @param {string} password, password for login
     *
     * #Allowable options:
     *
     * @description
     *
     * Validate user on basis of eenterd credential and create a session of unique data, get from token server.
     *
     * @returns {Promise} $q promise
     */
	  
      var login = function (username,password) {
	      var deferred = $q.defer();
	      var promise = deferred.promise;
	      if(!username || !password) {
	          return deferred.reject({ data: 'Please enter username & password'});
	      }
		  //, deviceid : device.uuid, devicetype : device.platform
	      var credentials = {email: username, password: password};
		  serviceData.send('signin', credentials).then(
	        function (res) {
			  if(res.response_code == 200){
				res.result.sso_token = serviceData.encryptToken(res.sso_token);
				config.setToken(res.result.sso_token).then(function(token){
				  res.result.sso_token = token;
				  setSession(serviceData.encryptDecrypt(res.result, 'decrypt'));
				  res.Type = 'Admin';
				  deferred.resolve(res);
				});
				
			  }else{
				deferred.reject(res);
			  }	
	      },function (error) {
			deferred.reject(error);
	      });
	      return promise;
      };
      
      // @private Auto login user from last saved cookie 
      var autoLogin = function(){
	    setSession($cookies.session);
	    return session;
      };
      
      // @private Check whther user is logged in or not
      var isAuthenticated = function () {
	  var session = this.getSession();
	  if (session.Type === 'Admin' || session.Type === 'Provider') {
	      return !!session.user_id;
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
	
    	serviceData.logData('Session Destroyed');
		$cookies.session = {};
        delete $cookies['session'];
		serviceGlobal.reset();
		session = {};
		serviceData.get('logout',{}).then(function(res){
    	  console.log(res);
		  
    	});
		$location.path('/login');
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