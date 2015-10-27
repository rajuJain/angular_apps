'use strict';

/**
 *
 * @ngdoc service
 * @name healthApp.service:serviceData
 * @description Data service to provide caching and offline save functionality.
 */

angular.module('patientPortalWorkList')
.provider('serviceData', function () {
  //Private objects
  var config = {};
  
  var prefix = {
    main: 'serviceData_',
    user: ''
  };

  var localStoragePrefix = function() {
   return prefix.main + prefix.user;
  };
    
  /**
   * @ngdoc
   * @methodOf healthApp.service:serviceData
   * @name healthApp.service:serviceData#setConfig
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
      return config.currentEnvironment.server + '/admin/';
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
          //var fh = fso.OpenTextFile("D:\\healthApp_error.txt", 8);
          $log.error(messageWithDate);
          //send('', { message: messageWithDate, type: "error" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else if(type == 'warn'){
          //var fh = fso.OpenTextFile("D:\\healthApp_warn.txt", 8);
          $log.warn(messageWithDate);
          //send('', { message: messageWithDate, type: "warn" }, {root : true, 'Content-Type': 'application/x-www-form-urlencoded'})
          
          }else{
          //var fh = fso.OpenTextFile("D:\\healthApp_info.txt", 8);
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
        deferral.reject({"error_text": "Connected but received a server error in response", "error_code": 500});
        return true;
      } else if(response && response.status && response.status === 400) {
        deferral.reject({"error_text": "Bad Request", "error_code": 400});
        return true;
      }else if(response && response.status && response.status === 401) {
        deferral.reject({"error_text": "Unautharized Request", "error_code" : 401});
		return true;
      }else if(response && response.status && response.status === 403) {
        deferral.reject({"error_text": "Forbidden", "error_code" : 403});
        return true;
      }else if(response && response.status && response.status === 404) {
        deferral.reject({"error_text": "Invalid Request", "error_code" : 404});
        return true;
      }else if(response && response.status && (response.status === 503 || response.status === 504)) {
        deferral.reject({"error_text": "Service Unavailable", "error_code" : response.status});
        return true;
      }else if(response && response.data){
        deferral.reject(response.data);
        return false;
      }
    };

    /**
     * @ngdoc
     * @name healthApp.service:serviceData#sendData
     * @methodOf healthApp.service:serviceData
     * @private
     * @param {SendObject} sendObject Object to send. Should be constructed via SendObject.
     * @description Sends an object of type SendObject. Internal only.
     */
     
    function sendData (sendObject) {
      logData('Send Data - ' + JSON.stringify(sendObject));
      var deferred = sendObject.deferral;
      var endpoint = sendObject.endpoint;
      var headers = sendObject.options.headers || {};
      headers['adminkey'] = config.currentEnvironment.serverKey;
      headers['admintoken'] = decryptToken(config.currentEnvironment.serverToken);
      sendObject.data.adminkey = config.currentEnvironment.serverKey;
      sendObject.data.admintoken = decryptToken(config.currentEnvironment.serverToken);
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
        url: endpoint + '?adminkey='+config.currentEnvironment.serverKey,
        data: sendObject.data,
	    //withCredentials : true,
		headers : headers
      };
      
      
      $http(sendConfig).success(function(response) {
        if (response.response_code && response.response_code == 200 && response.result && config.currentEnvironment.serverToken) {
            response.result = encryptDecrypt(response.result, 'decrypt');
            deferred.resolve(response);
        }else{
          deferred.resolve(response);  
        }
        
      }).error(function(data, status, headers, httpConfig) {
        var error = {data : data, status : status, headers : headers, httpConfig:httpConfig};
        parseError(error, sendObject);
                  	
      });
      return deferred.promise;
    }

    
    /**
     * @ngdoc
     * @methodOf healthApp.service:serviceData
     * @name healthApp.service:serviceData#getData
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
      headers['adminkey'] = config.currentEnvironment.serverKey;
      headers['admintoken'] = decryptToken(config.currentEnvironment.serverToken);
      
      var requestConfig = {
      	method: 'GET',
      	url: url,
      	//withCredentials : true,
      	headers : headers
      };
      
      if(query) {
      	requestConfig.params = query;
      }
      requestConfig.params = encryptDecrypt(requestConfig.params, 'encrypt');
      requestConfig.params.adminkey = config.currentEnvironment.serverKey;
      requestConfig.params.admintoken = decryptToken(config.currentEnvironment.serverToken);
      
      $http(requestConfig).success(function(response) {
        if (response.response_code && response.response_code == 200 && response.result && config.currentEnvironment.serverToken) {
            response.result = encryptDecrypt(response.result, 'decrypt');
            deferred.resolve(response);
        }else{
          deferred.resolve(response);  
        }
        
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
     * @name healthApp.service:serviceData#send
     * @methodOf healthApp.service:serviceData
     * @public
     * @param {string} endpoint The name of the table/collection to save the document under.
     * @param {object} data The data to send.
     * @param {options} options The optional options object.
     * @returns {$q.promise} The promise that will be resolved upon completion.
     *
     * @description Sends data to an endpoint
     */

    var send = function send(endpoint, data, options) {
      data = data || {};
      if(!endpoint) {
        throw 'Must use an endpoint to send.';
      }
      options = options || {};
      if (endpoint != 'signin') {
        data = encryptDecrypt(data, 'encrypt');  
      }
      
      //Handle the root option.
      endpoint = options.root ? rootUrl() + endpoint : dataUrl() + endpoint;

      var sendObject = new SendObject(endpoint, data, options);
      sendData(sendObject);
      return sendObject.deferral.promise;
    };
    
    
    /**
    * @ngdoc
    * @name healthApp.service:serviceData#haveConnection
    * @methodOf healthApp.service:serviceData
    * @description
    *
    * Runs to check internet connection status
    *
    */
  
    function haveConnection() {
      return !navigator.connection || navigator.connection.type !== Connection.NONE;
    }
    
   
    
    /**
     * @ngdoc
     * @name npl.service:serviceData#setData()
     * @methodOf npl.service:serviceData
     * @public
     * @param {String} key The key used to retrieve this data.
     * @param {Object} value The value to store at specified key
     * @param {Number} ttl Optional time to live for the data. 0 does not get stored and -1 is stored indefinitely.
     *
     * @returns {Object} The data as it has been stored
     *
     * @description Sets a local copy of data to be retrieved at this endpoint in the future
     *
     */

    var setData = function setData(key, value) {
      localStorage.setItem(localStoragePrefix() + key, encodeURIComponent(JSON.stringify(value)));
      return value;
    };
    
     /**
     * @ngdoc
     * @name npl.service:serviceData#getLocalData
     * @methodOf npl.service:serviceData
     * @private
     * @param {string} key the key to check for data
     * @return {DataObject} The object from cache or localStorage or false if nothing was stored.
     *
     * @description Checks for a local copy of the data and returns it if found.
     */
     
    //Check if we have the data locally.
    function getLocalData (key) {
      
      var localKey = localStoragePrefix() + key;
      if (localStorage.getItem(localKey)) {
        return JSON.parse(decodeURIComponent(localStorage.getItem(localKey)));
        
      } else {
        return false;
      }
    }
    
    
    /**
     * @ngdoc
     * @name npl.service:serviceData#clear
     * @methodOf npl.service:serviceData
     * @param {string} name The optional name of the cache location to clear.
     *
     * @description
     *
     * Clears data stored by the data service. Can either clear everything with no param or a named storage location when param `name` is set.
     *
     */
    var clearData = function(name) {
      if(name) {
        localStorage.removeItem(localStoragePrefix() + name);
      } else {
        localStorage.clear();
      }
    };
    
      
    var encryptDecrypt = function (inputData, cryptoType) {
      
      try{
          //Check Input Type
          var checkInputType = function(value){
              var loop = false;
              var type = '';
              if (angular.isArray(value)) {
                type = [];
                loop = true;
              }else if (angular.isObject(value)) {
                type = {};
                loop = true;
              }
              return {'loop' : loop, 'type' : type};
          }
          
          //Encrypt Single Value Input
          var encodeDecode = function(input){
            var password = decryptToken(config.currentEnvironment.serverToken);
            if (password == '' || config.currentEnvironment.serverToken == input || typeof input == 'boolean') {
              return input;
            }
            input = input ? input.toString() : '';
            if (cryptoType == 'encrypt') {
              var encoded = CryptoJS.AES.encrypt(input, password);
              return encoded ? encoded.toString() : input;  
            }else{
              var plaintext = CryptoJS.AES.decrypt(input, password);
              var plainTextString = CryptoJS.enc.Utf8.stringify(plaintext);
              return plainTextString ? plainTextString.trim() : input; 
            }
            
          }
          
          var encodeDecodeDataBunch = function(bunch){
            var inputDetails = checkInputType(bunch);
            var data = inputDetails.type;
            
            if (inputDetails.loop) {
                angular.forEach(bunch, function(value,key){
                  if (angular.isArray(value) || angular.isObject(value)) {
                    return encodeDecodeDataBunch(value);  
                  }else{
                    data[key] = encodeDecode(value); 
                  }
                  
                });
            }else{
              data = encodeDecode(bunch);
            }
            return data;
          }
          
          var inputDetails = checkInputType(inputData);
          var finalData = inputDetails.type;
          
          if (inputDetails.loop) {
            angular.forEach(inputData, function(value,key){
              if (value || value == 0) {
                var subDetails = checkInputType(value);
                if (subDetails.loop) {
                  finalData[key] = encodeDecodeDataBunch(value);
                }else{
                  finalData[key] = encodeDecode(value);  
                }
              }
              
            })
          }else{
            finalData = encodeDecode(inputData);
          }
          
          if (!finalData) {
            finalData = inputData;
          }
          return finalData;
        
      }catch (ex) {
        console.log('Error in Try Block - ' + ex);
        return inputData;
      }
   };
     
    var encryptToken = function(input){
       var password = config.currentEnvironment.serverKey;
       var encoded = CryptoJS.AES.encrypt(input, password);
       return encodeURIComponent(encoded.toString());
    };
    
    var decryptToken = function(input){
       var password = config.currentEnvironment.serverKey;
       var plaintext = CryptoJS.AES.decrypt(decodeURIComponent(input), password);
       return plaintext.toString(CryptoJS.enc.Utf8);
    };

    return {
      send: send,
      get: getData,
      logData : logData,
      dataUrl : dataUrl(),
      rootUrl : rootUrl(),
      haveConnection : haveConnection,
      setData : setData,
      getLocalData : getLocalData,
      clearData : clearData,
      encryptDecrypt : encryptDecrypt,
      encryptToken : encryptToken,
      decryptToken : decryptToken
    };
  }];
});
