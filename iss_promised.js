const request = require('request-promise-native');

const fetchMyIP = function () {
  return request('https://api1.ipify.org?format=json')
}

/* 
 * Makes a request to freegeoip.app using the provided IP address, to get its geographical information (latitude/longitude)
 * Input: JSON string containing the IP address
 * Returns: Promise of request for lat/lon
 */
const fetchCoordsByIP = function (body) {
  let ip = JSON.parse(body).ip;
  //console.log(request(`'https://api.freegeoip.app/json/' + ${ip} + '?apikey=e328c890-9720-11ec-8232-0b95c4535c90'`));
  return request(`https://api.freegeoip.app/json/${ip}?apikey=e328c890-9720-11ec-8232-0b95c4535c90`);

};


const fetchISSFlyOverTimes = function (coords) {
  const URL = 'https://iss-pass.herokuapp.com/json/?lat=' + JSON.parse(coords).latitude + '&lon=' + JSON.parse(coords).longitude;
  return request(URL);
}

const nextISSTimesForMyLocation = function () {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data);
      return response;
    })
};


module.exports = { nextISSTimesForMyLocation }