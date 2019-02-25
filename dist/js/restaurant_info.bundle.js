(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Common database helper functions.
 */
var DBHelper =
/*#__PURE__*/
function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: "fetchRestaurants",

    /**
     * Fetch all restaurants.
     */
    value: function fetchRestaurants() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return new Promise(function (resolve, reject) {
        fetch("".concat(DBHelper.DATABASE_URL, "/").concat(id)).then(function (response) {
          return response.json();
        }).then(function (restaurant) {
          return resolve(restaurant);
        }).catch(function (error) {
          return reject("Request failed. Returned status of ".concat(error));
        });
      });
    }
    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: "fetchRestaurantById",
    value: function fetchRestaurantById(id) {
      return new Promise(function (resolve, reject) {
        DBHelper.fetchRestaurants(id).then(function (restaurant) {
          return restaurant ? resolve(restaurant) : reject('Restaurant does not exist');
        });
      });
    }
    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisine",
    value: function fetchRestaurantByCuisine(cuisine) {
      return DBHelper.fetchRestaurants().then(function (restaurants) {
        return restaurants.filter(function (r) {
          return r.cuisine_type == cuisine;
        });
      });
    }
    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByNeighborhood",
    value: function fetchRestaurantByNeighborhood(neighborhood) {
      return DBHelper.fetchRestaurants().then(function (restaurants) {
        return restaurants.filter(function (r) {
          return r.neighborhood == neighborhood;
        });
      });
    }
    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisineAndNeighborhood",
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
      return DBHelper.fetchRestaurants().then(function (restaurants) {
        var results = restaurants;

        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
        }

        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
        }

        return results;
      });
    }
    /**
     * Fetch all neighborhoods with proper error handling.
     */

  }, {
    key: "fetchNeighborhoods",
    value: function fetchNeighborhoods() {
      return DBHelper.fetchRestaurants().then(function (restaurants) {
        // Get all neighborhoods from all restaurants
        var neighborhoods = restaurants.map(function (v, i) {
          return restaurants[i].neighborhood;
        }); // Remove duplicates from neighborhoods

        var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
          return neighborhoods.indexOf(v) == i;
        });
        return uniqueNeighborhoods;
      });
    }
    /**
     * Fetch all cuisines with proper error handling.
     */

  }, {
    key: "fetchCuisines",
    value: function fetchCuisines() {
      return DBHelper.fetchRestaurants().then(function (restaurants) {
        // Get all cuisines from all restaurants
        var cuisines = restaurants.map(function (v, i) {
          return restaurants[i].cuisine_type;
        }); // Remove duplicates from cuisines

        var uniqueCuisines = cuisines.filter(function (v, i) {
          return cuisines.indexOf(v) == i;
        });
        return uniqueCuisines;
      });
    }
    /**
     * Restaurant page URL.
     */

  }, {
    key: "urlForRestaurant",
    value: function urlForRestaurant(restaurant) {
      return "./restaurant.html?id=".concat(restaurant.id);
    }
    /**
     * Restaurant image URL.
     */

  }, {
    key: "imageUrlForRestaurant",
    value: function imageUrlForRestaurant(restaurant) {
      return "/img/".concat(restaurant.photograph, ".jpg");
    }
    /**
     * Map marker for a restaurant.
     */

  }, {
    key: "mapMarkerForRestaurant",
    value: function mapMarkerForRestaurant(restaurant, map) {
      // https://leafletjs.com/reference-1.3.0.html#marker  
      var marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      });
      marker.addTo(map);
      return marker;
    }
  }, {
    key: "DATABASE_URL",

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    get: function get() {
      return 'http://localhost:1337/restaurants';
    }
  }]);

  return DBHelper;
}();

exports.default = DBHelper;

},{}],2:[function(require,module,exports){
"use strict";

var _dbhelper = _interopRequireDefault(require("./dbhelper"));

var _swhelper = _interopRequireDefault(require("./swhelper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var restaurant;
var newMap;
/**
 * Initialize map as soon as the page is loaded.
 */

document.addEventListener('DOMContentLoaded', function () {
  _swhelper.default.install();

  initMap();
});
/**
 * Initialize leaflet map
 */

function initMap() {
  fetchRestaurantFromURL().then(function (restaurant) {
    newMap = L.map('map', {
      center: [restaurant.latlng.lat, restaurant.latlng.lng],
      zoom: 16,
      scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
      mapboxToken: 'pk.eyJ1IjoiamRvbnNhbiIsImEiOiJjanFycjIxcW4wbzBkNDhtZDUwbTZobjlqIn0.kEudKiNOT9o9uXZi5AIBPg',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(newMap);
    fillBreadcrumb(restaurant);

    _dbhelper.default.mapMarkerForRestaurant(restaurant, newMap);
  }).catch(console.error);
}
/**
 * Get current restaurant from page URL.
 */


function fetchRestaurantFromURL() {
  return new Promise(function (resolve, reject) {
    var id = getParameterByName('id');

    if (!id) {
      return reject('No restaurant id in URL');
    }

    _dbhelper.default.fetchRestaurantById(id).then(function (restaurant) {
      if (!restaurant) return reject('No exist this restaurant with this id');
      fillRestaurantHTML(restaurant);
      resolve(restaurant);
    }).catch(function (error) {
      return reject(error);
    });
  });
}
/**
 * Create restaurant HTML and add it to the webpage
 */


function fillRestaurantHTML(restaurant) {
  var name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  var address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  var image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = 'Restaurant ' + restaurant.name;
  image.src = _dbhelper.default.imageUrlForRestaurant(restaurant);
  var cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type; // fill operating hours

  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  } // fill reviews


  fillReviewsHTML(restaurant.reviews);
}
/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */


function fillRestaurantHoursHTML(operatingHours) {
  var hours = document.getElementById('restaurant-hours');

  for (var key in operatingHours) {
    var row = document.createElement('tr');
    var day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    var time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
}
/**
 * Create all reviews HTML and add them to the webpage.
 */


function fillReviewsHTML(reviews) {
  var container = document.getElementById('reviews-container');
  var title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    var noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  var ul = document.getElementById('reviews-list');
  reviews.forEach(function (review) {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}
/**
 * Create review HTML and add it to the webpage.
 */


function createReviewHTML(review) {
  var li = document.createElement('li');
  li.appendChild(createHeaderReviewHTML(review));
  li.appendChild(createBodyReviewHTML(review));
  return li;
}

function createHeaderReviewHTML(review) {
  var h3 = document.createElement('h3');
  var name = document.createElement('span');
  name.innerHTML = review.name;
  h3.appendChild(name);
  var date = document.createElement('span');
  date.innerHTML = review.date;
  h3.appendChild(date);
  return h3;
}

function createBodyReviewHTML(review) {
  var div = document.createElement('div');
  var rating = document.createElement('span');
  rating.innerHTML = "Rating: ".concat(review.rating);
  div.appendChild(rating);
  var comments = document.createElement('p');
  comments.innerHTML = review.comments;
  div.appendChild(comments);
  return div;
}
/**
 * Add restaurant name to the breadcrumb navigation menu
 */


function fillBreadcrumb(restaurant) {
  var breadcrumb = document.getElementById('breadcrumb');
  var li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}
/**
 * Get a parameter by name from page URL.
 */


function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp("[?&]".concat(name, "(=([^&#]*)|&|#|$)")),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

},{"./dbhelper":1,"./swhelper":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Common sw helper functions.
 */
var SWHelper =
/*#__PURE__*/
function () {
  function SWHelper() {
    _classCallCheck(this, SWHelper);
  }

  _createClass(SWHelper, null, [{
    key: "install",

    /**
     * Install Service Worker.
     */
    value: function install() {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/sw.js').then(function () {
          return console.log('SW registered!!');
        }).catch(function (error) {
          return console.log('Error registering sw. Reason:', error);
        });
      }
    }
  }]);

  return SWHelper;
}();

exports.default = SWHelper;

},{}]},{},[2]);
