/*
    Based on the Mixpanel nodejs library, copyright Mixpanel, Inc.
    (http://mixpanel.com/)
    (https://github.com/mixpanel/mixpanel-node)

    Copyright (c) 2012 Carl Sverre
    Released under the MIT license.
*/

var https           = require('https'),
    querystring     = require('querystring'),
    Buffer          = require('buffer').Buffer,
    facebook        = require('./facebook');

var create_client = function(apiKey, config) {
    var money = {};

    if(!apiKey) {
        throw new Error("The cashbot client requires a cashbot API key: 'init(apiKey)'. Please contact support@cashbot.ai to request an API key.");
    }

    money.config = {
        debug: false,
        verbose: false,
        host: 'api.cashbot.ai',
        protocol: 'https'
    };

    money.apiKey = apiKey;

    /**
     * sends an async GET or POST request to cashbot.ai
     * @param {object} options
     * @param {string} options.endpoint
     * @param {object} options.data         the data to send in the request
     * @param {string} [options.method]     e.g. 'get' or 'post', defaults to 'get'
     * @param {function} callback           called on request completion or error
     */

    var log_message = function(msg) {
      if (money.config.debug || money.config.verbose) {
        console.log(msg);
      }
    }

    var verbose_message = function(msg) {
      if (money.config.verbose) {
        console.log(msg);
      }
    }

    var wrap_request = function(options, success, fail, method, content, callback) {
        var request = https.request(options, function(res) {
            var data = ''; 
            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                var e = null;
                try { 
                    var result = JSON.parse(data);
                    if (typeof result === 'string' && result !== 'OK') {
                        result = JSON.parse(result);
                    }
                    if (res.statusCode < 200 || res.statusCode > 299) {
                        result.statusCode = res.statusCode;
                        fail(result);
                    } else {
                        if (callback) {
                            success(e, result);
                        } else {
                            success(result);
                        }
                    }
                } catch(ex) {
                    var e = new Error("Could not parse response from cashbot\n" + data);
                    fail(e);
                }
            });
        });

        request.on('error', function(e) {
            fail(e);
        });

        if (method === 'POST') {
            request.write(content);
        }

        request.end();
    };

    var send_query_request = function(options, callback) {
        var content = (Buffer.from(JSON.stringify(options.data))).toString('utf-8'),
            endpoint = options.endpoint,
            method = (options.method || 'GET').toUpperCase(),
            query_params = options.query_params,
            request_options = {
                host: money.config.host,
                port: money.config.port,
                headers: {},
                method: method
            },
            request;

        if (method === 'POST') {
            request_options.headers['Content-Type'] = 'application/json';
            request_options.headers['Content-Length'] = Buffer.byteLength(content);
        } else if (method === 'GET') {
            query_params = options.data;
        }
        query_params.apiKey = money.apiKey;

        request_options.path = endpoint + '?' + querystring.stringify(query_params);
        log_message(request_options.path);

        if (callback) {
            wrap_request(request_options, callback, callback, method, content, true);
        } else {
            return new Promise(function(resolve, reject) {
              return wrap_request(request_options, resolve, reject, method, content);
            });
        }
    };

    var send_request = function(options, callback) {
        var content = (Buffer.from(JSON.stringify(options.data))).toString('utf-8'),
            endpoint = options.endpoint,
            method = (options.method || 'GET').toUpperCase(),
            query_params = {},
            request_options = {
                host: money.config.host,
                port: money.config.port,
                headers: {
                  'x-api-key': money.apiKey
                },
                method: method
            },
            request;

        if (method === 'POST') {
            request_options.headers['Content-Type'] = 'application/json';
            request_options.headers['Content-Length'] = Buffer.byteLength(content);
        } else if (method === 'GET') {
            query_params = options.data;
        }

        request_options.path = endpoint + '?' + querystring.stringify(query_params);
        log_message(request_options.path);

        if (callback) {
            wrap_request(request_options, callback, callback, method, content, true);
        } else {
            return new Promise(function(resolve, reject) {
              return wrap_request(request_options, resolve, reject, method, content);
            });
        }
    };

    /**
     * Send a request to cashbot.ai using the specified endpoint (e.g. 'recommend', 'query')
     * @param {string} type - GET or POST
     * @param {string} endpoint - API endpoint name
     * @param {object} input - optional query parameters
     * @param {Function} [callback] - callback for request completion/error
     * apiKey in the header
     */
    var do_request = function(type, endpoint, input, callback) {
        verbose_message(type + " cashbot:\n", endpoint, input);

        return send_request({ method: type, endpoint: endpoint, data: input }, callback);
    };

    /**
     * Send a query request to cashbot.ai using the specified endpoint (e.g. 'recommend', 'query')
     * @param {string} type - GET or POST
     * @param {string} endpoint - API endpoint name
     * @param {object} input - optional query parameters
     * @param {Function} [callback] - callback for request completion/error
     * apiKey in the query string
     */
    var do_query_request = function(type, endpoint, input, callback, query_params) {
        verbose_message(type + " cashbot:\n", endpoint, input);

        return send_query_request({ method: type, endpoint: endpoint, data: input, query_params: query_params }, callback);
    };

    /**
     * Validate type of time property, and convert to Unix timestamp if necessary
     * @param {Date|number} time - value to check
     * @returns {number} Unix timestamp
     */
    var ensure_timestamp = function(time) {
        if (!(time instanceof Date || typeof time === 'number')) {
            throw new Error('datetime must be a Date or Unix timestamp');
        }
        return time instanceof Date ? Math.floor(time.getTime() / 1000) : time;
    };

    var ensure_n = function(n) {
        if (n && !parseInt(n)) {
            throw new Error("'n' must be type integer between 1 and 20");
        }
        n = parseInt(n);
        if (n < 1 || n > 20) {
          throw new Error("'n' must be type integer between 1 and 20");
        }
        return n;
    };

    /**
     * breaks array into equal-sized chunks, with the last chunk being the remainder
     * @param {Array} arr
     * @param {number} size
     * @returns {Array}
     */
    var chunk = function(arr, size) {
        var chunks = [],
            i = 0,
            total = arr.length;

        while (i < total) {
            chunks.push(arr.slice(i, i += size));
        }
        return chunks;
    };

    var validate = function(obj, param, type) {
        if(typeof obj[param] === 'undefined') {
            return false;
        }
        var realtype = type;
        if (type === 'integer' || type === 'float') {
            realtype = 'number';
        }
        if (typeof obj[param] !== realtype) {
            if (typeof obj[param] === 'string' && type === 'integer') {
                return parseInt(obj[param]);
            } else if (typeof obj[param] === 'string' && type === 'float') {
                return parseFloat(obj[param]);
            }
            return false;
        }
        return obj[param];
    }

    /**
         getQuery(userId, options, callback)
         ---
         this function requests recommendations from cashbot.ai
         See (https://cashbot.ai/documentation/#recommend-reference) for a
           complete list of valid options.

         userId:string                   a distinct ID for the user
         options:object                  optional parameters to customize the
                                         recommendation response from cashbot.ai
         callback:function(err:Error,    optional callback function to be called
                             res:Object) when the request is finished or an error occurs
     
         if callback is not set, returns a promise
     */
    money.getQuery = function(userId, options, callback) {
        return money.getRecommendations(userId, options, callback, true);
    };

    /**
         postGetQuery(userId, options, callback)
         ---
         this function sends user demographic data then requests recommendations from cashbot.ai
         See (https://cashbot.ai/documentation/#recommend-reference) for a
           complete list of valid options.

         userId:string                   a distinct ID for the user
         input:object (userInput)        user input values following userDemographics schema
         callback:function(err:Error,    optional callback function to be called
                             res:Object) when the request is finished or an error occurs
     
         if callback is not set, returns a promise
     */
    money.postGetQuery = function(userId, input, callback) {
        if (!userId) {
            throw new Error("'userId' is a required parameter");
        }

        var endpoint = `/recommend/${userId}/query`;
        if (!input || typeof input !== 'object') {
            throw new Error("'input' is a required parameter of type userDemographics object");
        }
        var valid_optional_attributes = { profile_pic: 'string', first_name: 'string', last_name: 'string' };
        var valid_required_attributes = { timezone: 'integer', gender: 'string', locale: 'string' };
        var valid_query_attributes = { label: 'string', n: 'integer' };
        var valid_widgets = [ 'list', 'carousel', 'card' ];
        var valid_formats = [ 'facebook', 'api' ];

        var send_input = {},
            query_params = { recommend: true };
        for (var ij in valid_required_attributes) {
            if (typeof input[ij] === 'undefined') {
                throw new Error(`'input' is missing a required parameter: "${ij}"`);
            }
        }
        for (var ij in input) {
            if (valid_optional_attributes[ij]) {
                if (!validate(input, ij, valid_optional_attributes[ij])) {
                    throw new Error(`'input' attribute "${ij}" is of wrong type: should be type "${valid_optional_attributes[ij]}"`);
                }
                send_input[ij] = input[ij];
            } else if (valid_required_attributes[ij]) {
                if (!validate(input, ij, valid_required_attributes[ij])) {
                    throw new Error(`'input' attribute "${ij}" is of wrong type: should be type "${valid_required_attributes[ij]}"`);
                }
                send_input[ij] = input[ij];
            } else if (valid_query_attributes[ij]) {
                if (!validate(input, ij, valid_query_attributes[ij])) {
                    throw new Error(`'input' attribute "${ij}" is of wrong type: should be type "${valid_query_attributes[ij]}"`);
                }
                query_params[ij] = input[ij];
            } else if (ij === 'widget') {
                if (!validate(input, ij, 'string')) {
                    throw new Error(`'input' attribute "${ij}" is of wrong type: should be type "${'string'}"`);
                }
                if (valid_widgets.indexOf(input[ij]) < 0) {
                    throw new Error(`'input' attribute "${ij}" is an invalid value: should be one of "${JSON.stringify(valid_widgets)}"`);
                }
                query_params[ij] = input[ij];
            } else if (ij === 'format') {
                if (!validate(input, ij, 'string')) {
                    throw new Error(`'input' attribute "${ij}" is of wrong type: should be type "${'string'}"`);
                }
                if (valid_formats.indexOf(input[ij]) < 0) {
                    throw new Error(`'input' attribute "${ij}" is an invalid value: should be one of "${JSON.stringify(valid_formats)}"`);
                }
                query_params[ij] = input[ij];
            }
        }
        if (('n' in query_params) && (query_params.n > 5 || query_params.n < 1)) {
            throw new Error(`'input' attribute "n" is an invalid value: should be between 1 and 5`);
        }

        return do_query_request('POST', endpoint, send_input, callback, query_params);
    };

    /**
         getRecommendations(userId, options, callback)
         ---
         this function requests recommendations from cashbot.ai
         See (https://cashbot.ai/documentation/#recommend-reference) for a
           complete list of valid options.

         userId:string                   a distinct ID for the user
         options:object                  optional parameters to customize the
                                         recommendation response from cashbot.ai
         callback:function(err:Error,    optional callback function to be called
                             res:Object) when the request is finished or an error occurs
         isQuery:boolean                 put apiKey in query string
         
         if callback is not set, returns a promise
     */
    money.getRecommendations = function(userId, options, callback, isQuery) {
        if (!userId) {
          throw new Error("'userId' is a required parameter");
        }

        if (!options || typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (options['n']) {
            options['n'] = ensure_n(options['n']);
        }

        if (isQuery) {
          return do_query_request('GET', `/recommend/${userId}/query`, options, callback);
        }
        return do_request('GET', '/recommend/' + userId, options, callback);
    };

    /**
        sendUserInput(userId, input, callback)
        ---
        this function sends user inputs to cashbot.ai to improve recommendations
        See (https://cashbot.ai/documentation/#recommend-reference) for a
          complete list of input parameters.

        userId:string                   a distinct ID for the user
        input:object (userInput)        user input values following userInput schema
        callback:function(err:Error,    optional callback function to be called
                            res:Object) when the request is finished or an error occurs

        if callback is not set, returns a promise
    */
    money.sendUserInput = function(userId, input, callback, bypass) {
        if (!userId) {
            throw new Error("'userId' is a required parameter");
        }

        var endpoint = '/recommend/' + userId;
        if (!bypass) {
            if (!input || typeof input !== 'object') {
                throw new Error("'input' is a required parameter of type userInput object");
            }

            var types = ['speech', 'text', 'multimedia', 'event', 'blob'];
            if (!input['type'] || types.indexOf(input['type']) < 0) {
                throw new Error("'input' must contain a valid 'type'");
            }

            if (!input['value'] || typeof input['value'] !== 'object') {
                throw new Error("'input' must contain a valid 'value' of type inputValue object");
            }

            var val = input['value'];
            if (!val['intent'] || typeof val['intent'] !== 'string') {
                throw new Error("'value' must contain a valid 'intent' of type string");
            }
            if (!val['value'] || typeof val['value'] !== 'string') {
                throw new Error("'value' must contain a valid 'value' of type string");
            }

            input['date'] = ensure_timestamp(input['date'] || Date.now());

            input['recommend'] = input['recommend'] || false;
            if (input['recommend'] !== true && input['recommend'] !== false) {
                throw new Error("'recommend' must be type boolean");
            }

            input['n'] = ensure_n(input['n'] || 5);
        } else {
          endpoint = endpoint + '/' + bypass;
        }

        return do_request('POST', endpoint, input, callback);
    };

    /**
        setConfig(config)
        ---
        Modifies the cashbot config

        config:object       an object with properties to override in the
                            cashbot client config
    */
    money.setConfig = function(config) {
        for (var c in config) {
            if (config.hasOwnProperty(c)) {
                if (c == 'host') { // Split host, into host and port.
                    money.config.host = config[c].split(':')[0];
                    var port = config[c].split(':')[1];
                    if (port) {
                        money.config.port = Number(port);
                    }
                } else {
                    money.config[c] = config[c];
                }
            }
        }
    };

    money.facebook = {
        get: function(userId, options, callback) {
          var validTypes = ['carousel', 'list', 'card'];
          if (callback) {
            money.getRecommendations(userId, options, function(err, res) {
              if (err) {
                callback(err, res);
              } else if (options.type && validTypes.indexOf(options.type) > -1) {
                callback(err, facebook[options.type](res, options.label ? options.label : null));
              } else {
                callback(err, facebook.carousel(res, options.label ? options.label : null));
              }
            });
          } else {
            return money.getRecommendations(userId, options)
              .then(function(res) {
                if (options.type && validTypes.indexOf(options.type) > -1) {
                  return facebook[options.type](res, options.label ? options.label : null);
                } else {
                  return facebook.carousel(res, options.label ? options.label : null);
                }
              });
          }
        },
        getCarousel: function(userId, options, callback) {
          if (callback) {
            money.getRecommendations(userId, options, function(err, res) {
              if (err) {
                callback(err, res);
              } else {
                callback(err, facebook.carousel(res, options.label ? options.label : null));
              }
            });
          } else {
            return money.getRecommendations(userId, options)
              .then(function(res) {
                return facebook.carousel(res, options.label ? options.label : null);
              });
          }
        },
        sendUserInput: function(userId, input, callback) {
          if (!input || typeof input !== 'object') {
            throw new Error("'input' is a required parameter of type object");
          }
          if (!input['webhook'] || typeof input['webhook'] !== 'object') {
            throw new Error("'webhook' is a required parameter in 'input' of type object");
          }

          if (callback) {
            money.sendUserInput(userId, input, function(err, res) {
              if (err) {
                callback(err, res);
              } else if (res !== 'OK') {
                callback(err, facebook.carousel(res, input.label ? input.label : null));
              } else {
                callback(err, res);
              }
            }, 'facebook');
          } else {
            return money.sendUserInput(userId, input, null, 'facebook')
              .then(function(res) {
                if (res !== 'OK') {
                  return facebook.carousel(res, input.label ? input.label :  null);
                }
                return res;
              });
          }
        }
    };

    if (config) {
        money.setConfig(config);
    }

    return money;
};

// module exporting
module.exports = {
    init: create_client
};
