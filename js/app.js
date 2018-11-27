// general variables
var map;
function setMarkers(position) {
    var self = this;
    this.markName = position.name;
	this.markLat = position.lat;
	this.markLong = position.long;
    this.imgURL = '';
    this.title = '';
    this.visible = ko.observable(true);

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
        self.title = img.title;
    }).fail(function() {
        // failing message
        alert('Oops. there is an error while loading flickr API, please try again!');
    });




    // recognizing info window content using data that we got it from google API and flickr API
    this.infowindowcontent = '<h4 class="infowindowhead">' + self.title + '</h4>' +
    '<img src=' + self.imgURL + '>';

    // setting the content to info window
    this.InfoWindow = new google.maps.InfoWindow({content: self.infowindowcontent});
    
    // setting the content to the marker
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.markLat, this.markLong),
        map: map,
        title: position.name,
        animation: google.maps.Animation.DROP
    });

    // set the marker to the map
    this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

    // adding listener to the marker in order to open and animate the marker when clicking on it
    this.marker.addListener('click', function() {
        self.infowindowcontent = '<h4 class="infowindowhead">' + self.title + '</h4>' +
        '<img src=' + self.imgURL + '>';

        self.InfoWindow.setContent(self.infowindowcontent);
        self.InfoWindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
}
// main function
function AppViewModel() {
    var self = this;
    this.input = ko.observable("");
	this.locations = ko.observableArray([]);

    // Creating the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: new google.maps.LatLng(41.015137, 28.979530)
    });

    // create for loop in order to apply setMrkers function on every position in positions
	for (var i=0; i < positions.length; i++) {
        self.locations.push(new setMarkers(positions[i]));
    }

	this.visibility = ko.computed(function() {
		var filter = self.input().toLowerCase();
		if (!filter) {
			for (var i=0; i < self.locations().length; i++) {
				self.locations()[i].visible(true);
			}
			return self.locations();
		} else {
			return ko.utils.arrayFilter(self.locations(), function(item) {
				var string = item.title.toLowerCase();
				var result = (string.search(filter) >= 0);
				item.visible(result);
				return result;
			});
		}
	}, self);
}
function throwError() {
    alert('Oops. there is a bug while loading google maps, please try again!');
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}
