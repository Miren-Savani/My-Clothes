import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { backendUrl, currency } from '../App';
import {toast} from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({token}) => {
  const [orders,setOrders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchAllOrders = async() => {
    if(!token){
      return null;
    }else{
      try{
        const response = await axios.post(backendUrl+"/api/order/list",{},{headers:{token}});
        if(response.data.success){
          setOrders(response.data.orders.reverse());
          setLastUpdated(new Date());
        }else{
          toast.error(response.data.message);
        }
      }
      catch(error){
        console.log(error.message);
        toast.error(response.data.message);
      }
    }
  }

  const statusHandler = async(event,orderId) => {
    try{
      const response = await axios.post(backendUrl+"/api/order/status",{orderId, status:event.target.value},{headers:{token}});
      if(response.data.success){
        await fetchAllOrders();
      }
    }
    catch(error){
      console.log(error.message);
      toast.error(response.data.message);
    }
  }

  useEffect(() => {
    fetchAllOrders();
    
    // Auto-refresh orders every 30 seconds to catch cancellations
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  },[token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3>Order Page</h3>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button 
          onClick={fetchAllOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          🔄 Refresh Orders
        </button>
      </div>
      <div>
        {
          orders.map((order,index) => (
            <div key={index} className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] items-start border-2 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm rounded-lg ${
              order.status === 'Cancelled' 
                ? 'border-red-300 bg-red-50 text-red-700' 
                : 'border-gray-200 text-gray-700'
            }`}>
              <img className="w-12 rounded-s-md" src={assets.parcel_icon} alt="" />
              <div>

                <div>
                {order.items.map((item,index) => {
                  if(index===order.items.length-1){
                    return <p className="py-0.5" key={index}>{item.name} X {item.quantity} <span>{item.size}</span></p>
                  }else{
                    return <p className="py-0.5" key={index}>{item.name} X {item.quantity} <span>{item.size}</span>,</p>
                  }
                })}
                </div>
                <p className="mt-2 font-medium">{order.address.firstName+" "+order.address.lastName}</p>
                <div>
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : {order.payment?"Done":"Pending"}</p>
                <p>{new Date(order.date).toLocaleDateString()}</p>
                {order.status === 'Cancelled' && (
                  <p className="mt-2 text-red-600 font-semibold text-sm">⚠️ Order Cancelled by Customer</p>
                )}
              </div>
              <p className="text-sm sm:text-[15px]">{currency}{order.amount}</p>
              {order.status === 'Delivered' ? (
                <span className="inline-block px-3 py-2 rounded-md bg-green-100 text-green-700 font-medium border border-green-200">Delivered</span>
              ) : (
                <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className={`p-2 font-medium ${
                  order.status === 'Cancelled' 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : 'bg-white border-gray-300'
                }`}>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out of Delivery">Out of Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              )}

            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders