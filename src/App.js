import logo from './logo.svg';
import React, { useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Pages/Login";
import PickerMain from "./PickerMain"
import Favs from "./Pages/Favs"
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config.js";

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth"));

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear()
      setIsAuth(false)
      window.location.pathname = "/PlacePicker/login";
    })
  }
  return (
    <>
      <Router>
        <nav>
          <Link to="/PlacePicker">Find Places!</Link>
          {isAuth && <Link to="/PlacePicker/favs">Favorites</Link>}
          {!isAuth ? <Link to="/PlacePicker/login">Login</Link> : <button className="submit" onClick={signUserOut}>Log Out</button>}
        </nav>
        <Routes>
          <Route path="/PlacePicker/favs" element={<Favs isAuth={ isAuth }/>}></Route>
          <Route path="/PlacePicker/login" element={<Login setIsAuth={setIsAuth}/>}></Route>
          <Route path="/PlacePicker" element={<PickerMain isAuth={ isAuth }/>}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
