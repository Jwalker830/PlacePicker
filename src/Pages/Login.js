import React from "react";
import { setDoc, doc, query, collection, where, getDocs } from "firebase/firestore";
import { db, auth, provider} from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuth }){

    let navigate = useNavigate();

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then((result) => {
            addUser()
            localStorage.setItem("isAuth", true);
            setIsAuth(true);
            navigate("/PlacePicker");
        })
    }

    const addUser = async () => {
        var exist = false;
        const q = query(collection(db, "users"), where("id", "==", auth.currentUser.uid));
        const data = await getDocs(q);
        data.forEach((doc) => {
            exist = true;
        })
        if(!exist){
            await setDoc(doc(db, "users", auth.currentUser.uid), {name: auth.currentUser.displayName, id: auth.currentUser.uid, places: []}, { merge: true });
        }
    }

    return <div className="loginPage">
        <p>Sign In With Google to Continue</p>
        <button className="login-with-google-btn" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>;
}

export default Login;