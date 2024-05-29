import React, { useEffect, useState } from "react";
import { setDoc, doc, query, collection, where, getDocs } from "firebase/firestore";
import { db, auth, provider} from "../firebase-config";
import { useNavigate } from "react-router-dom";
import PlaceComponent from "../PlaceComponent";

function Favs({ isAuth }) {
    const [favList, setFavs] = useState([]);
    const [onMobile, setOnMobile] = useState(() => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    });

    let navigate = useNavigate();

    const getFavs = async () => {
        if (!auth) {
            console.error("User is not loaded");
            return;
        }

        const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const placesSet = new Set();
        
        querySnapshot.forEach((doc) => {
            doc.data().places.forEach((place) => {
                placesSet.add(place);
            });
        });

        setFavs(Array.from(placesSet));
    };

    useEffect(() => {
        if (localStorage.getItem("isAuth") === "false") {
            console.log(isAuth);
            navigate("/login");
        } else {
            getFavs();
        }
    }, []);

    return (
        <>
            {favList.map((place, index) => (
                <div 
                    className='placeDiv' 
                    key={index} 
                    style={{
                        fontSize: onMobile ? "15px" : "20px", 
                        padding: onMobile ? "2px" : "5px"
                    }}
                >
                    <PlaceComponent isAuth={ isAuth } p={place} />
                    <div className='infoDisplay'>
                        <div>Price level: {place.price}</div>
                        <div>{place.distance} by Driving</div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default Favs;
