const http = require('http');

function callLambda(lambda) {
  const env = lambda["0"];
  const handler = lambda["1"];

  return (...args) => handler(env, ...args);
}

const Node = (key, value, rest) => [null, "Map", "Node", key, value, rest];
const Empty = [null, "Map", "Empty"];

function toMap(obj) {
  const objKeys = Object.keys(obj);
  const objValues = Object.values(obj);

  if (objKeys.length === 0) {
    return Empty;
  }
  
  function helper(keys, values) {
    if (keys.length === 0) {
      return Empty;
    }
    return Node(keys[0], values[0], helper(keys.slice(1), values.slice(1)));
  }

  return helper(objKeys, objValues);
}

function fromMap(map) {
  if (map[2] === "Empty") {
    return {};
  }
  return { [map[3]]: map[4], ...fromMap(map[5]) };
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