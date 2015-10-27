'use strict';

/**
 *
 * @ngdoc service
 * @name sdi.service:serviceAuth
 * @description Auth service to provide all authentication related functionality.
 */

angular.module('sdi')
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
  
  
  this.$get = ['$location', '$route', '$q', '$cookies', 'config', 'serviceData', 'serviceGlobal', function ($location, $route, $q, $cookies, config, serviceData, serviceGlobal) {
    
    //Create a fresh or reintialized last created session.
    var session = $cookies.session || {};
    
    /**
     * @ngdoc
     * @name sdi.service:serviceAuth#setSession
     * @methodOf sdi.service:serviceAuth
     * @public
     * @param {userData} userData Object to set as session.
     * @description Set session of logged in user.
     */
      
      var setSession = function(userData){
	serviceData.logData('Session created for ' + JSON.stringify(userData));
      if(userData.Status === 200){
        session = {};
        session.Email = userData.data.Email.trim();
        session.Name = userData.data.Name.trim();
        session.Role = userData.data.Role.trim();
        session.Token = userData.data.Token.trim();
        session.Gender = userData.data.Gender.trim();
      	session.Type = 'User';
        var AddressLine1 = (userData.data.AddressLine1 && userData.data.AddressLine1!=null) ? userData.data.AddressLine1.trim():'';
        var AddressLine2 = (userData.data.AddressLine2 && userData.data.AddressLine2!=null) ? ', '+userData.data.AddressLine2.trim():'';
        var City         = (userData.data.City && userData.data.City!=null) ? ', '+userData.data.City.trim():'';
        var State        = (userData.data.State && userData.data.State!=null) ? ', '+userData.data.State.trim():'';
        var Country      = (userData.data.Country && userData.data.Country!=null) ? ', '+userData.data.Country.trim():'';
        var Zipcode      = (userData.data.Zipcode && userData.data.Zipcode!=null) ? ', '+userData.data.Zipcode.trim():'';
        session.Address = AddressLine1+AddressLine2+City+State+Zipcode+Country;
        var geocoder = new google.maps.Geocoder();
          
        $cookies.session = JSON.stringify(session);
        serviceGlobal.userSession.gender = session.Gender;
      }
      return session;
    };
      
    /**
     * @ngdoc
     * @name sdi.service:serviceAuth#getSession
     * @public
     * @methodOf sdi.service:serviceAuth
     * @description Return logged in user session.
     */
    
      var getSession = function () {
      	 session = $cookies.session || {};

              if (!angular.isObject(session) && session.length > 0) {
                  session = JSON.parse(session)
                  if(session.Type && session.Type == 'User'){
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
     * @name sdi.service:serviceAuth#destroySession
     * @public
     * @methodOf sdi.service:serviceAuth
     * @description Reset lodded in user session.
     */  
      
      var destroySession = function(){
	      serviceData.logData('Session Destroyed');
	      session = {};
	      return session;
      };
      
      /**
     * @ngdoc
     * @methodOf sdi.service:serviceAuth
     * @name sdi.service:serviceData#login
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
	  
	      var data = {username: username, password: password};
	      serviceData.send('Account/Login', {'UserName':username,'Password':password},{root : true}).then(
	        function (res) {
		  if(!res.Error && res.Status === 200){
		    setSession(res);  
		  }
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
	      return !!session.Token;
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
    	serviceData.send('Account/LogOff',{userId : session.Email},{root : true}).then(function(res){
    	  console.log(res);
        window.location.href = serviceData.rootUrl;
    	});
        session = {};
        $cookies.session = {};
        delete $cookies['session'];
        serviceGlobal.userSession = {
                gender : '',
                mrn : '',
                isPregnant : ''
	      };
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