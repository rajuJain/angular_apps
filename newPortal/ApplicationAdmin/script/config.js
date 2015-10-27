'use strict';

/**
 * @ngdoc service
 * @name healthApp.service:config
 * @description
 *
 * Provides the main configuration interface and information for the app.
 *
 * Environment, in this context, means the server endpoint as well as endpoints behind the server that will be used (SAP, SQL db's, etc.)
 */

angular.module('patientPortalWorkList')
.service('config', function ($q) {
  
  /**
   * @ngdoc
   * @propertyOf healthApp.service:config
   * @name healthApp.service:config#environments
   * @description
   * A list of all the environments that can be accessed
   */

  var environments = this.environments = {
    prd: {
      text: 'Production',
      server: '',
      baseURL : '',
      serverKey : '68F5H7HDKI97855BHJKYSNY68',
      serverToken : '',
      apptAvenueToken : ''
      
    },
    dev: {
      text: 'Development',
      server: '',
      baseURL : '',
      serverKey : '68F5H7HDKI97855BHJKYSNY68',
      serverToken : '',
      apptAvenueToken : ''
      
    },
    localhost: {
      text: 'Localhost',
      server: 'http://localhost:8080',
      baseURL : 'http://localhost:8080',
      serverKey : '68F5H4RGT697855BHJKYSNY68',
      serverToken : '',
      apptAvenueToken : ''
      
    },
    test: {
      text: 'Testing',
      server: '',
      baseURL : '',
      serverKey : '68F5H4RGT697855BHJKYSNY68',
      serverToken : '',
      apptAvenueToken : ''
      
    }
  };

  /**
   * @ngdoc
   * @propertyOf healthApp.service:config
   * @name healthApp.service:config#currentEnvironment
   * @description Gives access to the current environment for the app.
   */
  /**
   * @ngdoc
   * @propertyOf healthApp.service:config
   * @name healthApp.service:config#defaultEnvironment
   * @description Gives access to what the default environment was for this app version.
   */

  var currentEnvironment = this.currentEnvironment = this.defaultEnvironment = environments.localhost;

  if(this.defaultEnvironment.text !== 'Production') {
    delete environments.prd;
  }

  /**
   * @ngdoc
   * @propertyOf healthApp.service:config
   * @name healthApp.service:config#version
   * @description Shows the current version number of the app.
   *
   * #This is automatically changed by the build script.
   */
  this.version = '0.0.1' //!!version!!
  
  /**
   * @ngdoc
   * @propertyOf healthApp.service:config
   * @name healthApp.service:config#writeLogData
   * @description log application activity only if it sets true.
   *
   * #set false in case of production.
   */
  
  this.writeLogData = false;
  
  /**
   * @ngdoc
   * @methodOf healthApp.service:config
   * @name healthApp.service:config#chooseEnvironment
   * @param {string} key The key of the environment to choose.
   * @description Allows the user to pick which environment they'd like to communicate with.
   */

  this.chooseEnvironment =  function(name) {
    currentEnvironment = environments[name];
    return currentEnvironment;
  };
  
  this.setToken = function(token){
    var deferred = $q.defer();
    var promise = deferred.promise;
    this.currentEnvironment.serverToken = token;
    if (this.currentEnvironment.serverToken) {
      deferred.resolve(this.currentEnvironment.serverToken);
    }
    return promise;
  };
  
  this.appointmentToken = function(apptToken){
    this.currentEnvironment.apptAvenueToken = apptToken;
    
    return true;
  };
  
  
});
/* Configuration Ends*/