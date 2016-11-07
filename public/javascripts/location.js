/**
 * Created by ministini on 2016-11-06.
 */

var mapInitialized = false;

$(document).ready(function() {



});


function location() {

    show_page("location");

    console.log("in location");

    if (!mapInitialized) {
        var mymap = L.map('mapID').setView([57.704005, 11.967924], 14);

        var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 17,
            minZoom: 8
        }).addTo(mymap);

        marker = L.marker([57.704005, 11.967924]).addTo(mymap);
    }

/*
    marker.bindPopup("<b>Challe's car</b><br>Current&nbsptemp:&nbsp<span id='challeId'></span>&nbsp°C");
*/


 }