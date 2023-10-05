const localData = JSON.parse(localStorage.getItem('data'));
const searchData = JSON.parse(localStorage.getItem('searchDetails'));
const resultArr = localData.results;

document.querySelector('#loc').innerText = searchData.location;
document.querySelector('#date').innerText = searchData.date;
document.querySelector('#guest').innerText = searchData.guest + " guest(s)";
const cardContainer = document.querySelector('.stay-wrapper');

let locations = [];
let userLoc = {};

function addColor(event) {
    if (event.target.style.color === 'red') {
        event.target.style.color = 'black';
    } else {
        event.target.style.color = 'red';
    }
}

function makeAmenities(arr) {
    return arr.join('&nbsp;|&nbsp;');
}

function makeListingCards() {
    resultArr.forEach(function (result) {
        let sampleCards = `
        <div class="img">
            <img src="${result.images[0]}" alt="${result.name}">
        </div>
        <div class="desc">
            <div class="title-cont">
                <div class="title">${result.type + ' in ' + result.city}</div>
                <div class="sub-title">${result.name}</div>
            </div>
            <div class="amanities-cont">
                <div class="first">
                    <p>${result.persons + ' guests'}&nbsp;|</p>
                    <p>${result.type}&nbsp;|</p>
                    <p>${result.beds + ' beds'}&nbsp;|</p>
                    <p>${result.bathrooms + ' bath'}</p>
                </div>
                <div class="sec">
                    <p>${makeAmenities(result.previewAmenities)}</p>
                </div>
            </div>
            <div class="review-cont">
                <div class="rating-desc">
                    <strong class="rating">${result.rating}</strong>
                    <img width="20px" src="./assets/star.svg" alt="rating">
                    <p>(${result.reviewsCount + ' reviews'})</p>
                </div>
                <div class="price-desc">
                ${result.price.priceItems[0].title.split(' x ')[0]} &nbsp; /night
                </div>
            </div>
            <i onclick="addColor(event)" style="color:black; padding-right:0.3rem; cursor: pointer;" class="fa-regular fa-heart"></i>
            <p class="distance"></p> <!-- Add a placeholder for distance -->
        </div>`;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = sampleCards;
        locations.push([result.name, result.lat, result.lng]);

        card.onclick = () => {
            if (localStorage.getItem('roomId')) {
                localStorage.removeItem('roomId');
            }
            localStorage.setItem('roomId', JSON.stringify({ 'id': result.id, 'price': result.price, 'result': { result } }));
            window.location.href = './rooms.html';
        };

        cardContainer.appendChild(card);
    });

    // Initialize the Leaflet map here after you have the locations
    const map = L.map('map').setView([locations[0][1], locations[0][2]], 8);
    const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
    }).addTo(map);

    for (let i = 0; i < locations.length; i++) {
        const marker = new L.marker([locations[i][1], locations[i][2]])
            .bindPopup(locations[i][0])
            .addTo(map);
    }

    // Get the user's geolocation and update distances
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLoc.latitude = position.coords.latitude;
            userLoc.longitude = position.coords.longitude;
            setDistance();
        });
    } else {
        console.log('no-geolocation');
    }
}

function getDistance(source, destination) {
    // return distance in meters
    const lon1 = toRadian(source[1]);
    const lat1 = toRadian(source[0]);
    const lon2 = toRadian(destination[1]);
    const lat2 = toRadian(destination[0]);

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const EARTH_RADIUS = 6371;
    return Math.round(c * EARTH_RADIUS * 1000);
}

function toRadian(degree) {
    return degree * Math.PI / 180;
}

function setDistance() {
    let i = 0;
    document.querySelectorAll('.distance').forEach((ele) => {
        const distance = getDistance([userLoc.latitude, userLoc.longitude], [locations[i][1], locations[i][2]]);
        ele.innerText = `Distance from you : ${distance} km`;
        i++;
    });
}

// Call the makeListingCards function after defining it
makeListingCards();
