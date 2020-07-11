/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FpZmFsaXRoYXJhbmkiLCJhIjoiY2tjZ3RqZWF2MHZjcDJzbnhraDEybjg1dSJ9.yBWw0YTO_NOKNnlNUXuqJQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/saifalitharani/ckcgtpno91g2d1in05lko9pjb',
    scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    // Create the marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add the marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    // Showing popups on the marker
    new mapboxgl.Popup({
        offset: 40
    }).setLngLat(loc.coordinates).setHTML(`<p> Day ${loc.day}: ${loc.description}`).addTo(map);

    bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
    }
});