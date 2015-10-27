'use strict';

/**
 * @ngdoc service
 * @name sdi.service:config
 * @description
 *
 * Provides the main configuration interface and information for the app.
 *
 * Environment, in this context, means the server endpoint as well as endpoints behind the server that will be used (SAP, SQL db's, etc.)
 */

angular.module('sdi')
.service('config', function () {
  
  /**
   * @ngdoc
   * @propertyOf sdi.service:config
   * @name sdi.service:config#environments
   * @description
   * A list of all the environments that can be accessed
   */

  var environments = this.environments = {
    prd: {
      text: 'Production',
      server: '',
      RequestVerificationToken: '',
      key: 'a2gaEKv9oIe7fae70e3813061e38fe7d5h1neX6-0ccf25bcef16b75b89dfe17421c7e36da3d7822b_Yb0tMDXYvHaMQgYoXuQe-Mhl4vWXfoM4DWQJKZw'
    },
    dev: {
      text: 'Development',
      server: '',
      RequestVerificationToken: '',
      key: 'a2gaEKv9oIe7fae70e3813061e38fe7d5h1neX6-0ccf25bcef16b75b89dfe17421c7e36da3d7822b_Yb0tMDXYvHaMQgYoXuQe-Mhl4vWXfoM4DWQJKZw'
    },
    localhost: {
      text: 'Localhost',
      server: 'http://localhost:18141',
      RequestVerificationToken: '',
      key: 'a2gaEKv9oIe7fae70e3813061e38fe7d5h1neX6-0ccf25bcef16b75b89dfe17421c7e36da3d7822b_Yb0tMDXYvHaMQgYoXuQe-Mhl4vWXfoM4DWQJKZw'
    },
    test: {
      text: 'Testing',
      server: '',
      RequestVerificationToken: '',
      key: 'a2gaEKv9oIe7fae70e3813061e38fe7d5h1neX6-0ccf25bcef16b75b89dfe17421c7e36da3d7822b_Yb0tMDXYvHaMQgYoXuQe-Mhl4vWXfoM4DWQJKZw'
    }
  };

  /**
   * @ngdoc
   * @propertyOf sdi.service:config
   * @name sdi.service:config#currentEnvironment
   * @description Gives access to the current environment for the app.
   */
  /**
   * @ngdoc
   * @propertyOf sdi.service:config
   * @name sdi.service:config#defaultEnvironment
   * @description Gives access to what the default environment was for this app version.
   */

  var currentEnvironment = this.currentEnvironment = this.defaultEnvironment = environments.localhost;

  if(this.defaultEnvironment.text !== 'Production') {
    delete environments.prd;
  }

  /**
   * @ngdoc
   * @propertyOf sdi.service:config
   * @name sdi.service:config#version
   * @description Shows the current version number of the app.
   *
   * #This is automatically changed by the build script.
   */
  this.version = '0.0.1' //!!version!!
  
  /**
   * @ngdoc
   * @propertyOf sdi.service:config
   * @name sdi.service:config#writeLogData
   * @description log application activity only if it sets true.
   *
   * #set false in case of production.
   */
  
  this.writeLogData = false;
  
  /**
   * @ngdoc
   * @methodOf sdi.service:config
   * @name sdi.service:config#chooseEnvironment
   * @param {string} key The key of the environment to choose.
   * @description Allows the user to pick which environment they'd like to communicate with.
   */

  this.chooseEnvironment =  function(name) {
    currentEnvironment = environments[name];
    return currentEnvironment;
  };
  this.setVerificationToken = function(token){
    this.currentEnvironment.RequestVerificationToken = token;
    return this.currentEnvironment.RequestVerificationToken;
  }
  
  //this.SDI_Authorization  = 'a2gaEKv9oIe7fae70e3813061e38fe7d5h1neX6-0ccf25bcef16b75b89dfe17421c7e36da3d7822b_Yb0tMDXYvHaMQgYoXuQe-Mhl4vWXfoM4DWQJKZw';
  
});
/* Configuration Ends*/