'use strict';

/**
 *
 * @ngdoc service
 * @name fvg.service:serviceAuth
 * @description Auth service to provide all authentication related functionality.
 */

angular.module('fvg')
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
  
  
  this.$get = ['$location', '$route', '$q', '$cookies', 'config', 'serviceData', 'serviceGlobal', 'serviceSync', function ($location, $route, $q, $cookies, config, serviceData, serviceGlobal, serviceSync) {
    
    //Create a fresh or reintialized last created session.
    var session = $cookies.session || {};
    
    /**
     * @ngdoc
     * @name fvg.service:serviceAuth#setSession
     * @methodOf fvg.service:serviceAuth
     * @public
     * @param {userData} userData Object to set as session.
     * @description Set session of logged in user.
     */
      
      var setSession = function(userData){
		serviceData.logData('Session created for ' + JSON.stringify(userData));
        session = {};
        session.user = userData.username.trim();
        session.password = userData.password.trim();
        session.Type = 'User';
		
        $cookies.session = JSON.stringify(session);
		return session;
	  };
      
	  /**
	   * @ngdoc
	   * @name fvg.service:serviceAuth#getSession
	   * @public
	   * @methodOf fvg.service:serviceAuth
	   * @description Return logged in user session.
	   */
    
	  var getSession = function () {
      	 session = $cookies.session || {};
              if (!angular.isObject(session) && session.length > 0) {
                  session = JSON.parse(session)
                  if(session.Type && session.Type == 'User' && session.user){
                    return session;
                  }else{
                    return false;
                  }
              } else {
                  return session;
              }
      	 
      };
      
    /**
     * @ngdoc
     * @name fvg.service:serviceAuth#destroySession
     * @public
     * @methodOf fvg.service:serviceAuth
     * @description Reset lodded in user session.
     */  
      
      var destroySession = function(){
	      serviceData.logData('Session Destroyed');
	      session = {};
	      return session;
      };
      
      /**
     * @ngdoc
     * @methodOf fvg.service:serviceAuth
     * @name fvg.service:serviceData#login
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
	  var encode = function (input) {
			var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
      };
      
      var login = function (username,password) {
	      var deferred = $q.defer();
	      var promise = deferred.promise;
	      if(!username || !password) {
	          return deferred.reject({ data: 'Please enter username & password'});
	      }
		  config.user(username,password);
	      var data = {username: username, password: password};
		  //console.log('Authorization : Basic '+ encode(username+ ':' +password));
	      serviceData.get('auth', {},{headers : {'Authorization' :'Basic '+ encode(username+ ':' +password)}, root : true}).then(
	        function (res) {
			  if(res.status == 200){
				localStorage.clear();
			    setSession(data);  
			  }
			config.user(username,password);
			/*serviceSync.syncData().then(function(response){
                console.log(response);
				deferred.resolve(res);
            },function(error){
                console.log(error);
				deferred.resolve(res);
            });*/
			deferred.resolve(res);
	      },
	      function (error) {
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
	  if (session.Type === 'User') {
	      return !!session.user;
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
    	/*serviceData.send('Account/LogOff',{userId : session.Email},{root : true}).then(function(res){
    	  console.log(res);
		  window.location.href = serviceData.rootUrl;
    	});*/
		localStorage.clear();
		serviceGlobal.reset();
        session = {};
        $cookies.session = {};
        delete $cookies['session'];
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