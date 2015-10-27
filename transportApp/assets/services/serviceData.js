'use strict';

/**
 *
 * @ngdoc service
 * @name fvg.service:serviceData
 * @description Data service to provide caching and offline save functionality.
 */

angular.module('fvg')
.provider('serviceData', function () {
  //Private objects
  var config = {};

  /**
   * @ngdoc
   * @methodOf fvg.service:serviceData
   * @name fvg.service:serviceData#setConfig
   * @description This allows you to set up at app startup whether certain `{string} endpoints` contain critical data that
   * should not be returned if invalid through the `{bool} returnExpiredData` key.
   */

  this.setConfig = function(endpoint, newConfig) {
    if(config[endpoint]) {
      console.error('serviceData endpoint already configured! Check the config of the module.');
    }
    config[endpoint] = newConfig;
  };
  
  this.$get = ['$http', '$timeout', '$q', '$cacheFactory','$log', 'config', function($http, $timeout, $q, $cacheFactory, $log, config) {
    var dataCache = $cacheFactory('dataCache');
    
    //@private method to get server url
    var rootUrl = function() {
      return config.currentEnvironment.server + '/';
    };
    
    //@private method to get api server url
    var dataUrl = function () {
      return config.currentEnvironment.server + '/wizard/agent/';
    };
    
    //@private method to get api server key
    var serverUser = function () {
      return config.currentEnvironment.user;
    };
    
    //@private method to get api server verification token
    var serverPassword = function () {
      return config.currentEnvironment.password;
    };
    
    //Write log at server for error
    var logData = function(message, type){
	  
      var now = new Date();
      var curr_date = now.getDate();
      var curr_month = now.getMonth();
      var curr_year = now.getFullYear();
      var curr_hour = now.getHours();
      var curr_mins = now.getMinutes();
      var curr_sec = now.getSeconds();
      
      type = type || 'debug';
      if (angular.isObject(message) || angular.isArray(message)) {
        message = JSON.stringify(message);
      }
      
      var messageWithDate = curr_date +'/'+ curr_month +'/'+curr_year +' '+ curr_hour +':'+ curr_mins +':'+ curr_sec +' : ' + message;
      
      if (config.writeLogData) {
          //var fso = new ActiveXObject("Scripting.FileSystemObject");
          
          if (type == 'error') {
          //var fh = fso.OpenTextFile("D:\\fvg_error.txt", 8);
          $log.error(messageWithDate);
          //send('', { message: messageWithDate, type: "error" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else if(type == 'warn'){
          //var fh = fso.OpenTextFile("D:\\fvg_warn.txt", 8);
          $log.warn(messageWithDate);
          //send('', { message: messageWithDate, type: "warn" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else{
          //var fh = fso.OpenTextFile("D:\\fvg_info.txt", 8);
          $log.debug(messageWithDate);
          //send('', { message: messageWithDate, type: type }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }
          //fh.WriteLine(messageWithDate);
          //fh.Close(); 
      }
    }

    //What to do for errors.
    var parseError = function(response, sendObject) {
      var deferral = sendObject.deferral;
      if(response && response.status && Math.floor(Number(response.status) / 100) === 5) {
        deferral.reject('Connected but received a server error in response');
        return true;
      } else if(response && response.status && response.status === 400) {
        deferral.reject('Bad Request');
        return true;
      }else if(response && response.status && response.status === 401) {
        deferral.reject('Unautharized Request');
		return true;
      }else if(response && response.status && response.status === 403) {
        deferral.reject('Forbidden');
        return true;
      }else if(response && response.status && response.status === 404) {
        deferral.reject('Not Found');
        return true;
      }else if(response && response.status && response.status === 503) {
        deferral.reject('Service Unavailable');
        return true;
      }else {
        deferral.reject(response);
        return false;
      }
    };

    /**
     * @ngdoc
     * @name fvg.service:serviceData#sendData
     * @methodOf fvg.service:serviceData
     * @private
     * @param {SendObject} sendObject Object to send. Should be constructed via SendObject.
     * @description Sends an object of type SendObject. Internal only.
     */
     
    function sendData (sendObject) {
      logData('Send Data - ' + JSON.stringify(sendObject));
      var deferred = sendObject.deferral;
      var endpoint = sendObject.endpoint;
      var headers = sendObject.options.headers || {};
      var user = serverUser();
      var password = serverPassword();
      if (user && password ) {
        headers['user'] = user;
        headers['password'] = password;
      }
      var verb;

      if(sendObject.options.method) {
        verb = sendObject.options.method;
      } else if(sendObject.data._id) {
        verb = 'put';
        endpoint += '/' + sendObject.data._id;
      } else {
        verb = 'post';
      }

      var sendConfig = {
        method : verb,
        url: endpoint,
        data: sendObject.data,
	    withCredentials : true,
		headers : headers
      };
      
      
      $http(sendConfig).success(function(response) {
        deferred.resolve(response);
      }).error(function(data, status, headers, httpConfig) {
        var error = {data : data, status : status, headers : headers, httpConfig:httpConfig};
        parseError(error, sendObject);
                  	
      });
      return deferred.promise;
    }

    
    /**
     * @ngdoc
     * @methodOf fvg.service:serviceData
     * @name fvg.service:serviceData#getData
     * @public
     * @param {string} key The key off the data to retrieve
     * @param {map} query A map of key-value pairs with which to filter data
     * @param {object} options The options for getting the data
     *
     * #Allowable options:
     *
     * @description
     *
     * Gets an optionally filtered dataset.
     *
     * @returns {Promise} $q promise
     */

    var getData = function getData(key, query, options) {
      logData('Get Data - Key :' + JSON.stringify(key) + ' Query : ' + JSON.stringify(query) + 'Options :' + JSON.stringify(options));
      var data;
      options = options || {};
      var deferred = $q.defer();
      var promise = deferred.promise;
      var url = options.root ? rootUrl() + key : dataUrl() + key;
      var headers = options.headers || {};
      
      var user = serverUser();
      var password = serverPassword();
      if (user && password ) {
        headers['user'] = user;
        headers['password'] = password;
      }
      headers['Content-Type'] = 'application/json;charset=UTF-8';
      
      var requestConfig = {
      	method: 'GET',
      	url: url,
      	withCredentials : true,
      	headers : headers
      };
      
      if(query) {
      	requestConfig.params = query;
      }
          
      $http(requestConfig).success(function(response) {
        deferred.resolve(response);
      }).error(function(data, status, headers, httpConfig){
        var error = {data : data, status : status, headers : headers, httpConfig: httpConfig};
         parseError(error, {deferral : deferred});
      });
	  
      return promise;
    };
    
    var SendObject = function(endpoint, data, options) {
      logData('Send object prepared');
      this.deferral = $q.defer();
      this.endpoint = endpoint;
      this.name = endpoint.split('/').pop();
      this.data = data;
      this.options = options;
    };

    
    /**
     * @ngdoc
     * @name fvg.service:serviceData#send
     * @methodOf fvg.service:serviceData
     * @public
     * @param {string} endpoint The name of the table/collection to save the document under.
     * @param {object} data The data to send.
     * @param {options} options The optional options object.
     * @returns {$q.promise} The promise that will be resolved upon completion.
     *
     * @description Sends data to an endpoint
     */

    var send = function send(endpoint, data, options) {
      if(!endpoint) {
        throw 'Must use an endpoint to send.';
      }
      options = options || {};

      //Handle the root option.
      endpoint = options.root ? rootUrl() + endpoint : dataUrl() + endpoint;

      var sendObject = new SendObject(endpoint, data, options);
      sendData(sendObject);
      return sendObject.deferral.promise;
    };
    

    return {
      send: send,
      get: getData,
      logData : logData,
      serverUser : serverUser,
      serverPassword : serverPassword,
      dataUrl : dataUrl(),
      rootUrl : rootUrl()

    };
  }];
});
