api = "https://api.mapbox.com/geocoding/v5/mapbox.places/"
location = "Union Square"
place = encodeURIComponent(location)
modifier =".json?proximity=-73.990593%2C40.740121&access_token="
PAT = "Your_personal_access_token"
url = `${api}${place}${modifier}${PAT}`;

// Make the GET request using fetch()
fetch(url)
.then(response => response.json()) // Parse the response as JSON
.then(data => {
    // Print the result
    console.log(data.features[0].geometry.coordinates);
})
.catch(error => {
    // Handle any errors
    console.error('Error:', error);
});