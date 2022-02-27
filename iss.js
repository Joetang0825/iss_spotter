const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(`Status Code ${response.statusCode} when fetching IP: ${body}`, null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};


/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, passtimes) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, passtimes);
      })
    })
  })
}






const fetchCoordsByIP = function (ip, callback) {
  //'https://api.freegeoip.app/json/8.8.8.8?apikey=e328c890-9720-11ec-8232-0b95c4535c90'
  const URL = 'https://api.freegeoip.app/json/' + ip + '?apikey=e328c890-9720-11ec-8232-0b95c4535c90';

  request(URL, (error, response, body) => {

    if (error) {
      callback(error, null); // Print the error if one occurred
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(msg, null);
      return;
    }

    callback(null, { "latitude": JSON.parse(body).latitude, "longitude": JSON.parse(body).longitude });
  });


};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function (coords, callback) {
  const URL = 'https://iss-pass.herokuapp.com/json/?lat=' + coords.latitude + '&lon=' + coords.longitude;

  request(URL, (error, response, body) => {

    if (error) {
      callback(error, null); // Print the error if one occurred
      return;
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching flyover times for coordinates. Response: ${body}`;
      callback(msg, null);
      return;
    }

    callback(null, JSON.parse(body).response);
  });
};


module.exports = { nextISSTimesForMyLocation };