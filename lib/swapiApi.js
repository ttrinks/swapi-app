import qs from 'qs'

/**
 * Get full Swapi URL from path
 * @param {string} path Path of the URL
 * @returns {string} Full Swapi URL
 */

const publicSwapiAPIUrl = "https://swapi.dev/";

export function getSwapiUrl(path = "") {
  return `${publicSwapiAPIUrl + path}`;
}

/**
 * Helper to make GET requests to Swapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API call response
 */

export async function fetchAPI(path, urlParamsObject = {}, options = {}) {
  // Merge default and user options
  const mergedOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Build request URL
  const queryString = qs.stringify(urlParamsObject);
  const requestUrl = `${getSwapiUrl(
    `/api${path}${queryString ? `?${queryString}` : ""}`
  )}`;

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions);

  // Handle response
  if (!response.ok) {
    console.error(response.statusText);
    throw new Error(`An error occured please try again`);
  }
  const data = await response.json();
  return data;
}

export async function fetchAllData(path) {

  // build request URL
  const requestUrl = publicSwapiAPIUrl+'/api'+path;
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

export async function fetchAllDataParallel(path) {

  // build request URL
  const requestUrl = publicSwapiAPIUrl+'/api'+path;

  // get the first page of results
  const response = await fetch(requestUrl);
  const data = await response.json();

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
  const allData = data.results.concat(...results.map(result => result.results));
  
  return allData;
}