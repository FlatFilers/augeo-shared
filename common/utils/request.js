import https from 'https';

// Function to make a POST request
export const post = async ({ hostname = 'hcm.show', path, body }) => {
  try {
    return new Promise((resolve, reject) => {
      // Creating an HTTPS request with the provided options
      const req = https.request(
        {
          method: 'POST',
          protocol: 'https:',
          hostname,
          path,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        (res) => {
          let result = '';

          // Handling the response data
          res.on('data', (chunk) => {
            result += chunk;
          });

          // Handling the end of the response
          res.on('end', () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              // If the response status code is successful, resolve with the result
              resolve(result);
            } else {
              // If the response status code is not successful, resolve with 'Failure'
              resolve('Failure');
            }
          });

          // Handling errors in the response
          res.on('error', (err) => {
            reject(new Error('HTTP call failed'));
          });
        }
      );

      // Converting the request body to JSON and sending it
      const bodyJson = JSON.stringify(body);
      req.write(bodyJson);
      req.end();
    });
  } catch (err) {
    console.error(`Fetch error: ${JSON.stringify(err, null, 2)}`);
  }
};
