/**
 * Created by ministini on 2016-11-06.
 */


function showLocation() {

 if (map) {
  return;
 }

 // Initiate map
 map = L.map('mapID');
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 17,
  minZoom: 1
 }).addTo(map);

 // Swedish bounds
 var north = L.latLng(69.06, 20.548611);
 var south = L.latLng(55.336944, 13.359444);
 var west = L.latLng(58.928611, 10.9575);
 var east = L.latLng(65.710833, 24.155833);

 map.fitBounds([
  [north], [south], [west], [east]
 ], {padding: [0.2, 0.2]});   // FIXME The diffference between 0.1 and 0.2 padding..

 // Read location data and put marker with temp data on map
 getCurrentTempGlobal();
 }