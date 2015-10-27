'use strict';

/**
 *
 * @ngdoc service
 * @name AngularDemo.service:serviceData
 * @description Data service to provide caching.
 */

angular.module('ngApiGateWay', ['ng'])
.provider('serviceData', function () {
  //Private objects
  var config = {};

  /**
   * @ngdoc
   * @methodOf AngularDemo.service:serviceData
   * @name AngularDemo.service:serviceData#setConfig
   * @description This allows you to set up at app startup whether certain `{string} endpoints` contain critical data that
   * should not be returned if invalid through the `{bool} returnExpiredData` key.
   */
  
  this.setConfig = function(configData) {
        var environments = (configData.environments) ? configData.environments : {};
        var currentEnvironment = (configData.currentEnvironment) ? configData.currentEnvironment : {};
        var writeLogData = (configData.writeLogData != undefined) ? configData.writeLogData : false;
        
        config = {environments: environments, currentEnvironment: environments[currentEnvironment], writeLogData: writeLogData};
  };
  
  this.$get = ['$http', '$timeout', '$q', '$cacheFactory','$log', '$location', '$rootScope', function($http, $timeout, $q, $cacheFactory, $log, $location, $rootScope) {
    var dataCache = $cacheFactory('dataCache');
    
    //@private method to get server url
    var rootUrl = function() {
      return config.currentEnvironment.server + '/';
    };
    
    //@private method to get api server url
    var dataUrl = function () {
      return config.currentEnvironment.server + '/api/';
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
          //var fh = fso.OpenTextFile("D:\\SDI_error.txt", 8);
          $log.error(messageWithDate);
          //send('', { message: messageWithDate, type: "error" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else if(type == 'warn'){
          //var fh = fso.OpenTextFile("D:\\SDI_warn.txt", 8);
          $log.warn(messageWithDate);
          //send('', { message: messageWithDate, type: "warn" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else{
          //var fh = fso.OpenTextFile("D:\\SDI_info.txt", 8);
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
      
      if(Math.floor(Number(response.status) / 100) === 5) {
        deferral.reject('Connected but received a server error in response: ' + response.data);
        return true;
      } else {
        deferral.reject(response);
        return false;
      }
    };

    /**
     * @ngdoc
     * @name AngularDemo.service:serviceData#sendData
     * @methodOf AngularDemo.service:serviceData
     * @private
     * @param {SendObject} sendObject Object to send. Should be constructed via SendObject.
     * @description Sends an object of type SendObject. Internal only.
     */
     
    function sendData (sendObject) {
      logData('Send Data - ' + JSON.stringify(sendObject));
      var deferred = sendObject.deferral;
      var endpoint = sendObject.endpoint;
      var headers = sendObject.options.headers || {};
      if (config.currentEnvironment.serverTokenName) {
        headers[config.currentEnvironment.serverTokenName] = config.currentEnvironment.serverTokenValue || null;
        sendObject.data[config.currentEnvironment.serverTokenName] = config.currentEnvironment.serverTokenValue || null; 
      }
      if (config.currentEnvironment.serverKeyName) {
        headers[config.currentEnvironment.serverKeyName] = config.currentEnvironment.serverKeyValue || null;
        sendObject.data[config.currentEnvironment.serverKeyName] = config.currentEnvironment.serverKeyValue || null; 
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
	      headers : headers
      };
      if(sendConfig.url.indexOf('https://') === 0) {
        /*sendConfig.headers = {
          'Authorization': 'Basic ' + window.btoa(srvConfig.currentEnvironment.user + ':' + srvConfig.currentEnvironment.key)
        };*/
      }
      
      $http(sendConfig).success(function(response) {
          if (!response.response_code && !response.error_code) {
            response = {};
            response.error_code = "AE100";
            response.error_text = 'Either server is too busy or invalid submited data. Please try Again !';
          }
        	//Data logging
        	if (response.error_code) {
        	 logData('Error in Sent - ' + JSON.stringify(response), 'warn');
        	}else{
        	  logData('Sent Response - ' + JSON.stringify(response));  
        	}
      	deferred.resolve(response);
	
      }).error(function(data, status, headers, httpConfig) {
          var error = {data : data, status : status, headers : headers, httpConfig :httpConfig };
          //parseError(error, sendObject);
      });
      
      /*, function(message) {
	logData('Warning in Sent - ' + JSON.stringify(message), 'warn');
        deferred.notify(message);
      });*/
      
      return deferred.promise;
    }

    
    /**
     * @ngdoc
     * @methodOf AngularDemo.service:serviceData
     * @name AngularDemo.service:serviceData#getData
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
      var url = dataUrl() + key;
      var headers = options.headers || {};
      if (config.currentEnvironment.serverTokenName) {
        headers[config.currentEnvironment.serverTokenName] = config.currentEnvironment.serverTokenValue || null;  
        query[config.currentEnvironment.serverTokenName] = config.currentEnvironment.serverTokenValue || null;  
      }
      if (config.currentEnvironment.serverKeyName) {
        headers[config.currentEnvironment.serverKeyName] = config.currentEnvironment.serverKeyValue || null;  
        query[config.currentEnvironment.serverKeyName] = config.currentEnvironment.serverKeyValue || null; 
      }

      var requestConfig = {
      	method: 'GET',
      	url: url,
      	headers : headers
      };
      if(url.indexOf('https://') === 0) {
	/*requestConfig.headers = {
	  'Authorization': 'Basic ' + window.btoa(srvConfig.currentEnvironment.user + ':' + srvConfig.currentEnvironment.key)
	};*/
      }
      
      if(query) {
      	requestConfig.params = query;
      }
          
      $http(requestConfig).success(function(response) {
      	 if (!response.response_code && !response.error_code) {
            response = {};
            response.error_code = "AE100";
            response.error_text = 'Either server is too busy or invalid submited data. Please try Again !';
          }
          
    	//Data logging
      	if (response.Error) {
        	 logData('Error in Data Recevied - ' + JSON.stringify(response), 'warn');
      	}else{
        	  logData('Data Recevied - ' + JSON.stringify(response));  
      	}
        deferred.resolve(response);
    	
	
      }).error(function(data, status, headers, httpConfig){
        var error = {data : data, status : status, headers : headers, httpConfig :httpConfig };
         deferred.reject(error);
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
     * @name AngularDemo.service:serviceData#send
     * @methodOf AngularDemo.service:serviceData
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
      config: config,
      dataUrl : dataUrl(),
      rootUrl : rootUrl()

    };
  }];
});