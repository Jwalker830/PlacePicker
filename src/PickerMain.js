import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { updateDoc, arrayUnion, collection, doc, setDoc, query, where, getDocs, arrayRemove } from "firebase/firestore";
import { db, auth, provider} from "./firebase-config";
import PlaceComponent from './PlaceComponent';

const PickerMain = ({ isAuth }) => {
    const [prompt, setPrompt] = useState("");
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [placeList, setPlaceList] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [onMobile, setOnMobile] = useState(() => {return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream});
    
    const setFav = async (fav) => {
        const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
                places: arrayUnion(fav)
            });
        });
    }

    const isFav = async (p) => {
        const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        let isFavorite = false;
        querySnapshot.forEach((doc) => {
            if (doc.data().places.includes(p)) {
                isFavorite = true;
            }
        });
        return isFavorite;
    }
    

    const clearMarkers = () => {
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
    };

    const getDist = (destination) => {
        if (!window.google) {
            console.error("Google Maps API is not loaded.");
            return Promise.reject("Google Maps API is not loaded.");
        }

        const service = new window.google.maps.DistanceMatrixService();

        return new Promise((resolve, reject) => {
            service.getDistanceMatrix(
                {
                    origins: [userLocation],
                    destinations: [destination],
                    travelMode: 'DRIVING',
                },
                (response, status) => {
                    if (status === "OK" && response.rows.length > 0) {
                        const element = response.rows[0].elements[0];
                        if (element.status === "OK") {
                            const distanceText = element.distance.text;
                            const durationText = element.duration.text;
                            resolve(distanceText + " (" + durationText + ")");
                        } else {
                            console.error("Distance Matrix request failed due to: " + element.status);
                            resolve("Distance not available");
                        }
                    } else {
                        console.error("Distance Matrix request failed due to: " + status);
                        resolve("Distance not available");
                    }
                }
            );
        });
    };

    useEffect(() => {
        // Get the user's location
        if (onMobile) {
            const element = document.getElementById('mapAndResults');
            if (element) {
              element.style.flexDirection = 'column';
            }
            console.log("ios");
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const location = { lat: latitude, lng: longitude };
                    setUserLocation(location);
                    if (map) {
                        map.setCenter(location);
                        map.setZoom(11);
                    }
                },
                (error) => {
                    console.error("Error getting user location: ", error);
                    // Fallback to default location if user denies geolocation
                    const defaultLocation = { lat: 37.4161493, lng: -122.0812166 };
                    setUserLocation(defaultLocation);
                    if (map) {
                        map.setCenter(defaultLocation);
                        map.setZoom(11);
                    }
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, [map]);

    const findPlaces = async (mapInstance) => {
        if (!window.google) {
            console.error("Google Maps API is not loaded.");
            return;
        }
        const service = new window.google.maps.places.PlacesService(mapInstance);

        const request = {
            query: prompt,
            fields: ['name', 'geometry', 'business_status'],
            locationBias: userLocation,
            openNow: true,
            type: 'restaurant',
            language: 'en-US',
            rankBy: window.google.maps.places.RankBy.PROMINENCE,
        };

        service.textSearch(request, async (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const bounds = new window.google.maps.LatLngBounds();

                const updatedPlaceList = [];
                const shuffledResults = results.sort(() => Math.random() - 0.5).slice(0, 3);

                clearMarkers();

                for (const place of shuffledResults) {
                    if (!place.geometry || !place.geometry.location) continue;

                    let distance;
                    try {
                        distance = await getDist(place.geometry.location);
                    } catch (error) {
                        console.error("Error fetching distance: ", error);
                        distance = "Distance not available";
                    }

                    var curlat = place.geometry.location.lat();
                    var curlng = place.geometry.location.lng();

                    const cur = {
                        name: place.name,
                        address: place.formatted_address,
                        price: place.price_level,
                        distance: distance,
                        location: {lat: curlat, lng: curlng}
                    };

                    const marker = new window.google.maps.Marker({
                        map: mapInstance,
                        position: place.geometry.location,
                        title: place.name,
                    });
            
                    setMarkers((prevMarkers) => [...prevMarkers, marker]);

                    updatedPlaceList.push(cur);
                    bounds.extend(place.geometry.location);
                }
                setPlaceList(updatedPlaceList);
                mapInstance.fitBounds(bounds);
            } else {
                console.log('No results');
            }
        });
    };

    const showMarker = (place) => {
        clearMarkers();
        const bounds = new window.google.maps.LatLngBounds();

        const marker = new window.google.maps.Marker({
            map: map,
            position: place.location,
            title: place.name,
        });
        
        bounds.extend(place.location);
        map.fitBounds(bounds);
        map.setZoom(15);
        setMarkers((prevMarkers) => [...prevMarkers, marker]);
    }

    return (
        <div id="mainContainer">
                <h1 style={{textAlign: "center"}}>Food Place Picker</h1>
                <div className='settings'>
                    <input className="prompt" type="text" placeholder="What type of place? ex: 'Tacos'" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <button className="submit" onClick={() => findPlaces(map)}>Search!</button>
                </div>
            <div id='mapAndResults'>
                <div className='resultsContainer'>
                    {placeList.map((place, index) => (
                        <div className='placeDiv' onClick={() => {showMarker(place)}} key={index} style={{fontSize: (onMobile ? "15px" : "20px" ), padding: (onMobile ? "2px" : "5px" )}}>
                            <PlaceComponent isAuth={ isAuth } p={ place }/>
                            {/*<div className='placeTitle'>{place.name} at {place.address}<div className='favStar' onClick={() => {setFav(place)}}>{isFav(place) ? "☆" : "★"}</div></div>*/}
                            <div className='infoDisplay'><div>Price level: {place.price}</div><div>{place.distance} by Driving</div></div>
                        </div>
                    ))}
                </div>
                <div className='mapContainer'>
                    <LoadScript
                        googleMapsApiKey="AIzaSyAhOA3TWPcId7DP_kTlIikrBEhF8a1W8Ww"
                        libraries={['places']}
                    >
                        <GoogleMap
                            mapContainerStyle={{ height: '100%', width: '100%' }}
                            onLoad={(map) => setMap(map)}
                        />
                    </LoadScript>
                </div>    
            </div>
        </div>
    );
}

export default PickerMain;
