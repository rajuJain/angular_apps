'use strict';

/**
 * @ngdoc service
 * @name fvg.service:config
 * @description
 *
 * Provides the main configuration interface and information for the app.
 *
 * Environment, in this context, means the server endpoint as well as endpoints behind the server that will be used (SAP, SQL db's, etc.)
 */

angular.module('fvg')
.service('config', function () {
  
  /**
   * @ngdoc
   * @propertyOf fvg.service:config
   * @name fvg.service:config#environments
   * @description
   * A list of all the environments that can be accessed
   */

  var environments = this.environments = {
    prd: {
      text: 'Production',
      server: '',
      baseURL : '',
      user: '',
      password: ''
    },
    dev: {
      text: 'Development',
      server: '',
      baseURL : '',
      user: '',
      password: ''
    },
    localhost: {
      text: 'Localhost',
      server: 'http://localhost',
      baseURL : 'http://localhost',
      user: '',
      password: ''
    },
    test: {
      text: 'Testing',
      server: '',
      baseURL : '',
      user: '',
      password: ''
    }
  };

  /**
   * @ngdoc
   * @propertyOf fvg.service:config
   * @name fvg.service:config#currentEnvironment
   * @description Gives access to the current environment for the app.
   */
  /**
   * @ngdoc
   * @propertyOf fvg.service:config
   * @name fvg.service:config#defaultEnvironment
   * @description Gives access to what the default environment was for this app version.
   */

  var currentEnvironment = this.currentEnvironment = this.defaultEnvironment = environments.test;

  if(this.defaultEnvironment.text !== 'Production') {
    delete environments.prd;
  }

  /**
   * @ngdoc
   * @propertyOf fvg.service:config
   * @name fvg.service:config#version
   * @description Shows the current version number of the app.
   *
   * #This is automatically changed by the build script.
   */
  this.version = '0.0.1' //!!version!!
  
  /**
   * @ngdoc
   * @propertyOf fvg.service:config
   * @name fvg.service:config#writeLogData
   * @description log application activity only if it sets true.
   *
   * #set false in case of production.
   */
  
  this.writeLogData = false;
  
  /**
   * @ngdoc
   * @methodOf fvg.service:config
   * @name fvg.service:config#chooseEnvironment
   * @param {string} key The key of the environment to choose.
   * @description Allows the user to pick which environment they'd like to communicate with.
   */

  this.chooseEnvironment =  function(name) {
    currentEnvironment = environments[name];
    return currentEnvironment;
  };
  this.user = function(user,password){
    this.currentEnvironment.user = user;
    this.currentEnvironment.password = password;
    return {'user' : user, 'password' : password};
  }
  
});
/* Configuration Ends*/