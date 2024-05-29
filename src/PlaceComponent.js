import React, { useEffect, useState } from 'react';
import { updateDoc, arrayUnion, collection, doc, query, where, getDocs, arrayRemove } from "firebase/firestore";
import { db, auth } from "./firebase-config";

const PlaceComponent = ({ p, isAuth }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const checkIfFavorite = async () => {
            try {
                const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                let favorite = false;
                querySnapshot.forEach((doc) => {
                    const places = doc.data().places;
                    places.forEach((place) => {
                        if (place.address === p.address) { // Compare by address
                            favorite = true;
                        }
                    });
                });
                setIsFavorite(favorite);
            } catch (error) {
                console.error("Error checking favorite status: ", error);
            }
        };
    
        checkIfFavorite();
    }, [p]);
    
    const setFav = async (fav) => {
        if(!isFavorite){
            try {
                const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, {
                        places: arrayUnion(fav)
                    });
                    setIsFavorite(true); // Update the state to reflect the change
                });
            } catch (error) {
                console.error("Error setting favorite status: ", error);
            }
        }
        else{
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                places: arrayRemove(fav)
            });
        }
    };

    return (
        <div className='placeTitle'>
            {p.name} at {p.address}
            <div className='favStar' onClick={() => { setFav(p) }}>
                {isAuth && (isFavorite ? "★" : "☆")}
            </div>
        </div>
    );
};

export default PlaceComponent;
