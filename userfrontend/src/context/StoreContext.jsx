import { createContext,useEffect,useState } from "react";
import axios from 'axios'
export const StoreContext = createContext();



const StoreContextProvider=(props)=>{

    const [cartItems,setCartItems] = useState({})
    const [food_list,setFoodList] = useState([])
    const url='https://backendprep.onrender.com'
    const [token,setToken] = useState("")

    const fetchFoodList = async()=>{
        const response=await axios.get(url+'/api/food/list')
        setFoodList(response.data.data)
    }
    
    useEffect(()=>{
        async function loadData(){
        await fetchFoodList()
        if(localStorage.getItem("token")){
       setToken(localStorage.getItem("token"))
    await loadCartData(localStorage.getItem("token"))
        }
        }
        loadData()
    },[])

   const loadCartData = async(token)=>{
        const response = await axios.get(url+"/api/cart/get",{headers:{token}})
        setCartItems(response.data.cartData)
   }

    const addToCart =async(itemId)=>{
        if(!cartItems[itemId])
            setCartItems({...cartItems,[itemId]:1})
        else
            setCartItems({...cartItems,[itemId]:cartItems[itemId]+1})
  if(token){
    try {
        await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
    } catch (error) {
        console.log(error)
    }
}

    }

    const removeFromCart =async(itemId)=>{
        setCartItems({...cartItems,[itemId]:cartItems[itemId]-1})
        if(token){
    try {

        await axios.delete(`${url}/api/cart/remove?itemId=${itemId}`,{headers:{token}})

    } catch (error) {
        console.log(error)
    }
}
    }
    const getTotalCartAmount=()=>{
        let total=0;
        for(let item in cartItems){
            if(cartItems[item]>0){
                let itemInfo = food_list.find(food=>food._id===item)
                total+=itemInfo.price*cartItems[item];
            }
        }
        return total;
    }
    const contextValues={
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,setToken,
        url
    }

    return(
        <StoreContext.Provider value={contextValues}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider
