// determaine universities locations
var positions = [
    {
        name : 'Bahçeşehir University',
        lat : 41.042165,
        long : 29.009258
    },
    {
        name : 'Istanbul Ünıversitesi',
        lat : 41.012604,
        long : 28.961836
    },
    {
        name : 'Istanbul Aydın University',
        lat : 40.991916,
        long : 28.797530
    },
    {
        name : 'Istanbul Technical University',
        lat : 41.105593,
        long : 29.025338
    },
    {
        name : 'Sabancı University',
        lat : 40.888534,
        long : 29.373989
    },
    {
        name : 'Yıldız Teknik University',
        lat : 41.052087,
        long : 29.010653
    }
];

// general variables
var map;

function setMarkers(position) {
    var self = this;
    this.markName = position.name;
	this.markLat = position.lat;
	this.markLong = position.long;
    this.address = '';
    this.type = '';
    this.imgURL = '';
    var key = 'AIzaSyAlylBNj9-_u10XrrTH9kIPfJZawxJCUrY';
    var apiLink = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + this.markName + '&bounds=' + this.markLat + ',' + this.markLong + '&key=' + key;

    // calling flickr API to show images
    $.ajax({
        url: 'http://api.flickr.com/services/rest/',
    data: {
        format: 'json',
        method: 'flickr.photos.search',
        api_key: '84c19543b50367001ace22f3362a9b84',
        user_id: '143607981@N03',
        text: self.markName
    },
    dataType: 'jsonp',
    jsonp: 'jsoncallback'
    }).done(function (result) {
        var img = result.photos.photo[0];
        self.imgURL = 'http://farm' + img.farm + '.static.flickr.com/' + img.server + '/' + img.id + '_' + img.secret + "_s.jpg";

    });
  
    // Calling Google API to get universities addresses
    $.getJSON(apiLink).done(function(university) {
        var info = university.results[0];
        self.address = info.formatted_address;
        self.type = info.types[2];
    }).fail(function() {
        // failing message
        alert("Oops. There is an error while loading fourSquare API, please try again");
    });
    
    // recognizing info window content using data that we got it from google API and flickr API
    this.infowindowcontent = '<h4 class="infowindowhead">' + position.name + '</h4>' +
    '<h5 class="type">' + self.type + '</h5>' +
    '<img src=' + self.imgURL + '>' +
    '<p class="street">' + self.address + '</p>';

    // setting the content to info window
    this.InfoWindow = new google.maps.InfoWindow({content: self.infowindowcontent});
    
    // setting the content to the marker
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(position.lat, position.long),
        map: map,
        title: position.name,
        animation: google.maps.Animation.DROP
    });

    // set the marker to the map
	this.marker.setMap(map);
    
    // adding listener to the marker in order to open and animate the marker when clicking on it
    this.marker.addListener('click', function() {
        self.infowindowcontent = '<h4 class="infowindowhead">' + position.name + '</h4>' +
        '<h5 class="type">' + self.type + '</h5>' +
        '<img src=' + self.imgURL + '>' +
        '<p class="street">' + self.address + '</p>';

        self.InfoWindow.setContent(self.infowindowcontent);
        self.InfoWindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });
}
// main function
function AppViewModel() {
    var self = this;

	this.locations = [];
    
    // Creating the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(41.015137, 28.979530)
    });

 
    // Setting AutoComplete property to the search input
    this.zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('search'));
    // bias the boundaries within the map for the zoom to area text.
    this.zoomAutocomplete.bindTo('bounds', map);

    // adding an event listener to the go button in order to zoom to area
    document.getElementById('go').addEventListener('click', function() {
        goToArea();
    });

    function goToArea() {
        // calling the geoCoder
        var geocoder = new google.maps.Geocoder();
        // Get the the area name entered in the input
        var address = document.getElementById('search').value;
        // identify that the address isn't empty
        if (address == '') {
            alert('please enter the area name');
        } else {
            // get the LatLng of the entered area name
            geocoder.geocode(
                { address: address,
                    componentRestrictions: {locality: 'Istanbul'}
                }, function(results, status) {
                    // Set LatLng to the center of the map and zoom to them
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        map.setZoom(15);
                    } else {
                        alert('the entered location does not exist, please try again');
                    }
                });
            }
        }
    // create for loop in order to apply setMrkers function on every position in positions
	for (var i=0; i < positions.length; i++) {
        self.locations.push(new setMarkers(positions[i]));
    }
}

function throwError() {
    alert('Oops. there is a bug while loading google maps, please try again!');
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}
