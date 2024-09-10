const http = require('http');

function callLambda(lambda) {
  const env = lambda["0"];
  const handler = lambda["1"];

  return (...args) => handler(env, ...args);
}

function toMap(obj) {
  return Object.entries(obj).map(([key, value]) => [null, "tuple", "tuple", key, value]);
}

function fromMap(map) {
  const obj = {};

  for (const [_, __, ___, key, value] of map) {
    obj[key] = value;
  }

  return obj;
}

function exportFunction(func) {
  return {
    "0": {},
    "1": (_, ...args) => func(...args),
  }
}

module.exports = {
  /**
   * Start a new HTTP server
   * @param {number} port 
   * @param {any} request_handler 
   * @returns 
   */
  start_server: (port, request_handler) => 
    http.createServer((req, res) => {
      const req_plume = [null, "Request", "Request", req.method, req.url, toMap(req.headers)];
      const res_plume = res;


      return callLambda(request_handler)(req_plume, res_plume);
    }).listen(port),

  /**
   * Respond to a request
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   * @param {*} status 
   * @param {*} headers 
   * @param {*} body 
   */
  respond: (res, status, headers, body) => {
    res.writeHead(status, fromMap(headers));
    res.end(body);

    return [null, "unit", "unit"];
  },

  /**
   * Check if a URL matches a desired URL
   * @param {string} url 
   * @param {string} desired 
   * @returns 
   */
  does_url_match: (url, desired) => {
    return url.startsWith(desired) 
      || url === desired 
      || url === `${desired}/`;
  }
}