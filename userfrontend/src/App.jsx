import React, { useState } from 'react'
import {Routes,Route} from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './screens/Home/Home'
import Cart from './screens/Cart/Cart'
import PlaceOrder from './screens/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'

const App = () => {

  const [showLogin,setShowLogin]=useState(false);

  return (
    <>
    {showLogin ? <LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className="app">
        <Navbar showLogin={showLogin} setShowLogin={setShowLogin}/>
        <Routes>
            <Route path='/' element={<Home/>}></Route>
            <Route path='/cart' element={<Cart/>}></Route>
            <Route path='order' element={<PlaceOrder/>}></Route>
        </Routes>
    </div>
    <Footer/>
    </>
  )
}

export default App