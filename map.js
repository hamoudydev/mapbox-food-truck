var transformRequest = (url, resourceType) => {
var isMapboxRequest =
  url.slice(8, 22) === "api.mapbox.com" ||
  url.slice(10, 26) === "tiles.mapbox.com";
return {
  url: isMapboxRequest
  ? url.replace("?", "?pluginName=sheetMapper&")
  : url
};
};
mapboxgl.accessToken = 'pk.eyJ1IjoibXRpYmEiLCJhIjoiY2xuM2NzdDFxMGd2dTJ3cXd3dTB2aDZjbyJ9.017dL9x4hH7wv_PPp945Ow'; 
  const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11', 
  center: [-83.2343, 42.3285],
  zoom: 11
});


$(document).ready(function () {
$.ajax({
  type: "GET",
  url: 'https://docs.google.com/spreadsheets/d/101KsINiQF23nHOiIZtIXJ01-zWrGyA4DQ_1U6hasDcA/gviz/tq?tqx=out:csv&sheet=Sheet1',
  dataType: "text",
  success: function (csvData) { makeGeoJSON(csvData); }
});

function makeGeoJSON(csvData) {
  csv2geojson.csv2geojson(csvData, {
  latfield: 'Latitude',
  lonfield: 'Longitude',
  delimiter: ','
}, function (err, data) {
map.on('load', function () {

map.addLayer({
    'id': 'csvData',
    'type': 'circle',
    'source': {
      'type': 'geojson',
      'data': data
    },
    'paint': {
      'circle-color': '#4264fb',
      'circle-radius': 12,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
});

// When a click event occurs on a feature in the csvData layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'csvData', function (e) {
 var coordinates = e.features[0].geometry.coordinates.slice();

//set popup text
//You can adjust the values of the popup to match the headers of your CSV.
// For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
var description = `<h3>` + e.features[0].properties.Name + `</h3>` + 
    `<h4>` + `<b>` + `Address: ` + `</b>` + e.features[0].properties.Map + `</h4>` +  
    `<h4>` + `<b>` + `Food Items: ` + `</b>` + e.features[0].properties.Foods + `</h4>` + 
    `<h4>` + `<b>` + `Hours: ` + `</b>` + e.features[0].properties.Hours + `</h4>`;

// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

//add Popup to map

new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'csvData', function () {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'places', function () {
    map.getCanvas().style.cursor = '';
});

var bbox = turf.bbox(data);
  map.fitBounds(bbox, { padding: 50 });

});

});
};
});