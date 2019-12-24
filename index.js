const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const server = http.createServer((req, res) => {
  // get url and parse
  const parsedUrl = url.parse(req.url, true);

  // get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get query string as object
  const queryStringObject = parsedUrl.query;

  // get the htttp method
  const method = req.method.toLowerCase();

  // get headers as an object
  const headers = req.headers;

  // get payload
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // determine hanlder
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // construct data object to send to hanlder
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload': buffer
    };

    // route request to specified handler
    chosenHandler(data, (statusCode, payload) => {
      // use defined status code or default
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // use defined payload or default
      payload = typeof(payload) == 'object' ? payload : {};

      // convert payload to string
      const payloadString = JSON.stringify(payload);

      // return response
      res.writeHead(statusCode);

      res.end(payloadString);

      console.log(`Response: ${statusCode}, ${payloadString}`);
    });
  });
});

server.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});

// define handlers
const handlers = {};

// sample handler
handlers.sample = (data, callback) => {
  // callback http status code and payload object
  callback(406, {'name': 'sample handler'});
};

// not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// define request router
const router = {
  'sample': handlers.sample
};