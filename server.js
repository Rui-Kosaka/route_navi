'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const stationLocationCache = new Map();
const CONTENT_TYPES = {
  '.css':'text/css; charset=utf-8',
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8'
};

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type':'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function findNearbyStations(latitude, longitude) {
  const query = '[out:json][timeout:15];(node(around:3000,' + latitude + ',' + longitude + ')[railway=station];way(around:3000,' + latitude + ',' + longitude + ')[railway=station];);out center;';
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method:'POST',
        headers:{
          'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
          'User-Agent':'route-navi/1.0'
        },
        body:'data=' + encodeURIComponent(query),
        signal:AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('駅情報を取得できませんでした');
}

async function findStationLocation(station) {
  if (stationLocationCache.has(station)) return stationLocationCache.get(station);

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.search = new URLSearchParams({
    q:station + '駅 東京都', format:'jsonv2', limit:'10', countrycodes:'jp'
  });
  const response = await fetch(url, {
    headers:{ Accept:'application/json', 'User-Agent':'route-navi/1.0' },
    signal:AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('駅の位置を検索できませんでした');

  const locations = await response.json();
  const location = locations.find(item => item.display_name.includes(station + '駅')) || locations[0];
  if (!location) throw new Error('駅の位置が見つかりませんでした');

  const stationLocation = { lat:Number(location.lat), lon:Number(location.lon) };
  stationLocationCache.set(station, stationLocation);
  return stationLocation;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');

  if (request.method === 'POST' && url.pathname === '/api/nearby-stations') {
    try {
      const { lat, lon } = JSON.parse(await readRequestBody(request));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('座標が不正です');
      sendJson(response, 200, await findNearbyStations(lat, lon));
    } catch (error) {
      sendJson(response, 502, { error:error.message || '最寄り駅を検索できませんでした' });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/station-location') {
    try {
      const { station } = JSON.parse(await readRequestBody(request));
      if (typeof station !== 'string' || !station.trim()) throw new Error('駅名が不正です');
      sendJson(response, 200, await findStationLocation(station.trim()));
    } catch (error) {
      sendJson(response, 502, { error:error.message || '駅の位置を検索できませんでした' });
    }
    return;
  }

  const relativePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  if (!filePath.startsWith(ROOT + path.sep)) {
    response.writeHead(403);
    response.end();
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type':CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  });
});

server.listen(PORT, () => {
  console.log('Route Navi is running at http://localhost:' + PORT);
});
