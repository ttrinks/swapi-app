import qs from 'qs'

/**
 * Get full Swapi URL from endpoint
 * @param {string} endpoint endpoint of the URL
 * @returns {string} Full Swapi URL
 */

const publicSwapiAPIUrl = "https://swapi.dev/api";

export function getSwapiUrl(endpoint = "") {
  return `${publicSwapiAPIUrl + endpoint}`;
}

/**
 * Helper to make GET requests to Swapi API endpoints
 * @param {string} endpoint endpoint of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API call response
 */

export async function fetchData(endpoint) {

    const requestUrl = publicSwapiAPIUrl + endpoint 

    // Trigger API call
    const response = await fetch(requestUrl);

  // Handle response
  if (!response.ok) {
    console.error(response.statusText);
    throw new Error(`An error occured please try again`);
  }
  const data = await response.json();
  return data;
}

export async function fetchAllData(endpoint) {

  // build request URL
  const requestUrl = publicSwapiAPIUrl+'/api'+endpoint;
  let allData = [];

  // get the first page of results
  let response = await fetch(requestUrl);
  let data = await response.json();
  allData = data.results;

  // get the remaining pages of results
  while (data.next) {
    response = await fetch(data.next);
    data = await response.json();
    allData = [...allData, ...data.results];
  }
  
  return allData;
}

const cache = {};

export async function fetchAndCacheData(endpoint, cacheTTL = 60 * 60 * 1000) {

  // caching method – less requests
  if (cache[endpoint] && cache[endpoint].expires > Date.now()) {
    return cache[endpoint].data; 
  }

  // build request URL
  const requestUrl = publicSwapiAPIUrl+endpoint;

  // get the first page of results
  const response = await fetch(requestUrl);
  let data = await response.json();

  // get results count and calculate amount of pages
  const resultsCount = data.count;
  const resultsPerPage = data.results.length
  const pageCount = Math.ceil(resultsCount / resultsPerPage)

  // create array of page URLs
  const pageUrls = Array.from({ length: pageCount - 1 }, (_, i) => `${requestUrl}?page=${i + 2}`);

  // make parallel requests for remaining pages
  const promises = pageUrls.map(url => fetch(url).then(response => response.json()));
  const results = await Promise.all(promises);
  
  // combine all results into a single array
  data = data.results.concat(...results.map(result => result.results));
  data = sortArrayByString(data, "name")
  if (endpoint == "/people") {
    data = data.map((item, index) => {
      return { ...item, id: (index + 1).toString(), year: convertBirthYearToNumber(item.birth_year) };
    });
  } else if ("/films"){
    sortArrayByProp(data, "episode_id")
    data = data.map((item, index) => {
      return { ...item, episode: convertToRoman(item.episode_id) };
    });
  }

  cache[endpoint] = {
    data,
    expires: Date.now() + cacheTTL
  };

  return data;
}

// convert the birth_year string into a number 
function convertBirthYearToNumber(birthYear) {
  const numericValue = parseInt(birthYear);
  if (isNaN(numericValue)) {
    return null;
  }
  // "B" for BBY = Before the Battle of Yavin --> under zero
  // else for ABY = After the Battle of Yavin --> over zero
  const sign = birthYear.slice(-3, -2) === "B" ? -1 : 1;
  return numericValue * sign;
}

// sort an array by a prop like "id"
function sortArrayByProp(arr, prop) {
  arr.sort(function(a, b) {
    return a[prop] - b[prop];
  });
  return arr;
}

// sort an array ny string
function sortArrayByString(arr, prop) {
  arr.sort(function(a, b) {
    if (a[prop] < b[prop]) {
      return -1;
    }
    if (a[prop] > b[prop]) {
      return 1;
    }
    return 0;
  });
  return arr;
}

// convert numbers to roman numericals
function convertToRoman(num) {
  const romanNumerals = {
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };

  let result = '';

  for (let key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      result += key;
      num -= romanNumerals[key];
    }
  }

  return result;
}
