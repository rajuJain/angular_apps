'use strict';

/**
 *
 * @ngdoc service
 * @name sdi.service:serviceData
 * @description Data service to provide caching and offline save functionality.
 */

angular.module('sdi')
.provider('serviceData', function () {
  //Private objects
  var config = {};

  /**
   * @ngdoc
   * @methodOf sdi.service:serviceData
   * @name sdi.service:serviceData#setConfig
   * @description This allows you to set up at app startup whether certain `{string} endpoints` contain critical data that
   * should not be returned if invalid through the `{bool} returnExpiredData` key.
   */

  this.setConfig = function(endpoint, newConfig) {
    if(config[endpoint]) {
      console.error('serviceData endpoint already configured! Check the config of the module.');
    }
    config[endpoint] = newConfig;
  };
  
  this.$get = ['$http', '$timeout', '$q', '$cacheFactory','$log', '$translate', '$location', '$rootScope', 'config', function($http, $timeout, $q, $cacheFactory, $log, $translate, $location, $rootScope, config) {
    var dataCache = $cacheFactory('dataCache');
    
    //@private method to get server url
    var rootUrl = function() {
      return config.currentEnvironment.server + '/';
    };
    
    //@private method to get api server url
    var dataUrl = function () {
      return config.currentEnvironment.server + '/api/';
    };
    
    //@private method to get api server key
    var serverKey = function () {
      return config.currentEnvironment.key;
    };
    
    //@private method to get api server verification token
    var serverToken = function () {
      return config.currentEnvironment.RequestVerificationToken;
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
		$log.error(messageWithDate);
		//send('', { message: messageWithDate, type: "error" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
		
	    }else if(type == 'warn'){
		$log.warn(messageWithDate);
		//send('', { message: messageWithDate, type: "warn" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
		
	    }else{
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
        deferral.reject('Connected but received a server error in response: ' + response.data.Message);
        return true;
      } else {
        deferral.reject(response);
        return false;
      }
    };

    /**
     * @ngdoc
     * @name sdi.service:serviceData#sendData
     * @methodOf sdi.service:serviceData
     * @private
     * @param {SendObject} sendObject Object to send. Should be constructed via SendObject.
     * @description Sends an object of type SendObject. Internal only.
     */
     
    function sendData (sendObject) {
      logData('Send Data - ' + JSON.stringify(sendObject));
      var deferred = sendObject.deferral;
      var endpoint = sendObject.endpoint;
      var headers = sendObject.options.headers || {};
      headers['SDI-Authorization'] = serverKey();
      headers['RequestVerificationToken'] = serverToken();
      var verb;

      if(sendObject.options.method) {
        verb = sendObject.options.method;
      } else if(sendObject.data._id) {
        verb = 'put';
        endpoint += '/' + sendObject.data._id;
      } else {
        verb = 'post';
      }
      var JSONDATA = JSON.stringify(sendObject.data);
       if (sendObject.name && sendObject.name!='EmailPreInstruction') {
            JSONDATA = (JSONDATA.replace(/\</g, '')).replace(/\>/g, '');
      }
      JSONDATA = JSON.parse(JSONDATA);
      
      var sendConfig = {
        method : verb,
        url: endpoint,
        data: JSONDATA,
	      headers : headers
      };
      if(sendConfig.url.indexOf('https://') === 0) {
        /*sendConfig.headers = {
          'Authorization': 'Basic ' + window.btoa(srvConfig.currentEnvironment.user + ':' + srvConfig.currentEnvironment.key)
        };*/
      }
      
      $http(sendConfig).success(function(response) {
        	if (response.Error && response.Error.MessageKey) {
        	  
        	  response.Error.Message = response.Error.MessageKey;
        	  
        	}else if (response.data && response.data.MessageKey) {
        	  
        	  response.data.Message = response.data.MessageKey;
        	}
		
		if (!response.data && !response.Error) {
		  response = {};
		  response.Error = {};
		  response.Error.Message = 'Either server is too busy or invalid submited data. Please try Again !';
		}
	
        	//Data logging
        	if (response.Error) {
        	 logData('Error in Sent - ' + JSON.stringify(response), 'warn');
        	}else{
        	  logData('Sent Response - ' + JSON.stringify(response));  
        	}
	
      	deferred.resolve(response);
	
      }).error(function(data, status, headers, httpConfig) {
          if(status === 403){
              RefreshToken();
              config.setVerificationToken($('#hdnToken').val());
              sendData(sendObject);
          }else if(status == 429){
            var msgStr = data;
            var time = msgStr.split(" ").pop(-1).replace('"', '');
            $rootScope.quotaExceededTime = time;
          $rootScope.isQuotaExceeded = true;
          $location.path('/quotaExceeded');
          deferred.reject({"Error":{"Code":429,"Message":"API calls quota exceeded! maximum admitted 5 per Minute.","MessageKey":"quotaExceeded"}});
	  }else{
            logData('Error in Sent - ' + JSON.stringify(data), 'error');
            parseError(data, sendObject);
          }        	
      });
      
      /*, function(message) {
	logData('Warning in Sent - ' + JSON.stringify(message), 'warn');
        deferred.notify(message);
      });*/
      
      return deferred.promise;
    }

    
    /**
     * @ngdoc
     * @methodOf sdi.service:serviceData
     * @name sdi.service:serviceData#getData
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
      headers['SDI-Authorization'] = serverKey();
      headers['RequestVerificationToken'] = serverToken();
      
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
      	if (response.Error && response.Error.MessageKey) {
      	  
      	  response.Error.Message = response.Error.MessageKey;
      	  
      	}else if (response.data && response.data.MessageKey) {
      	  
      	  response.data.Message = response.data.MessageKey;
      	  
      	}
	 if (!response.data && !response.Error) {
	    response = {};
	    response.Error = {};
	    response.Error.Message = 'Either server is too busy or invalid submited data. Please try Again !';
	  }
	
    	//Data logging
      	if (response.Error) {
        	 logData('Error in Data Recevied - ' + JSON.stringify(response), 'warn');
      	}else{
        	  logData('Data Recevied - ' + JSON.stringify(response));  
      	}
        deferred.resolve(response);
    	
	
      }).error(function(data, status, headers, httpConfig){
	  logData('Error in getting data - ' + JSON.stringify(data));
          if(status == 403 && lastRequestedUrl){
              RefreshToken();
              config.setVerificationToken($('#hdnToken').val());
              getData(key, query, options);
          }else if(status == 429){
            var msgStr = data;
            var time = msgStr.split(" ").pop(-1).replace('.', '').replace('"', '');
            $rootScope.quotaExceededTime = time;
            $rootScope.isQuotaExceeded = true;
            $location.path('/quotaExceeded');	    
            deferred.reject({"Error":{"Code":429,"Message":"API calls quota exceeded! maximum admitted 5 per Minute","MessageKey":"quotaExceeded"}});
	  }else{
            deferred.reject(data);
          }
      	
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
     * @name sdi.service:serviceData#send
     * @methodOf sdi.service:serviceData
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
      serverKey : serverKey,
      serverToken : serverToken,
      dataUrl : dataUrl(),
      rootUrl : rootUrl()

    };
  }];
});
