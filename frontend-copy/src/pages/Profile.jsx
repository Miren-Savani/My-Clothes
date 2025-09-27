import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const { token, backendUrl, navigate } = useContext(ShopContext);

  useEffect(() => {
    // Check if token exists in localStorage on page refresh
    const storedToken = localStorage.getItem('token');
    if (!token && !storedToken) {
      navigate('/login');
      return;
    }
    
    // If we have a token (either from context or localStorage), fetch data
    if (token || storedToken) {
      fetchUserProfile();
      fetchUserOrders();
    }
  }, [token, navigate]);

  const fetchUserProfile = async () => {
    try {
      const authToken = token || localStorage.getItem('token');
      const response = await axios.post(backendUrl + '/api/user/profile', {}, {
        headers: { token: authToken }
      });
      if (response.data.success) {
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name,
          email: response.data.user.email
        });
        // Set address data if available
        if (response.data.user.address) {
          setAddressData({
            firstName: response.data.user.address.firstName || '',
            lastName: response.data.user.address.lastName || '',
            email: response.data.user.address.email || '',
            street: response.data.user.address.street || '',
            city: response.data.user.address.city || '',
            state: response.data.user.address.state || '',
            zipcode: response.data.user.address.zipcode || '',
            country: response.data.user.address.country || '',
            phone: response.data.user.address.phone || ''
          });
        }
      } else {
        toast.error(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch profile');
      navigate('/login');
    }
  };

  const fetchUserOrders = async () => {
    try {
      const authToken = token || localStorage.getItem('token');
      const response = await axios.get(backendUrl + '/api/user/orders', {
        headers: { token: authToken }
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.log(error);
      // Don't show error toast as orders are not critical for profile view
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressInputChange = (e) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const authToken = token || localStorage.getItem('token');
      const response = await axios.put(backendUrl + '/api/user/profile', formData, {
        headers: { token: authToken }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    
    try {
      const authToken = token || localStorage.getItem('token');
      const response = await axios.put(backendUrl + '/api/user/address', {
        userId: user._id,
        address: addressData
      }, {
        headers: { token: authToken }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditingAddress(false);
        toast.success('Address updated successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update address');
    } finally {
      setAddressLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user.name,
      email: user.email
    });
    setIsEditing(false);
  };

  const cancelAddressEdit = () => {
    if (user.address) {
      setAddressData({
        firstName: user.address.firstName || '',
        lastName: user.address.lastName || '',
        email: user.address.email || '',
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipcode: user.address.zipcode || '',
        country: user.address.country || '',
        phone: user.address.phone || ''
      });
    } else {
      setAddressData({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
      });
    }
    setIsEditingAddress(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-[400px]">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-300">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Personal Information
              </h2>
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Address Information
                </h2>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {isEditingAddress ? 'Cancel' : user.hasAddress ? 'Edit Address' : 'Add Address'}
                </button>
              </div>
              
              {isEditingAddress ? (
                <form onSubmit={handleUpdateAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={addressData.firstName}
                        onChange={handleAddressInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={addressData.lastName}
                        onChange={handleAddressInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addressData.email}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={addressData.street}
                      onChange={handleAddressInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={addressData.city}
                        onChange={handleAddressInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={addressData.state}
                        onChange={handleAddressInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zipcode (6 digits)
                      </label>
                      <input
                        type="text"
                        name="zipcode"
                        value={addressData.zipcode}
                        onChange={handleAddressInputChange}
                        pattern="[0-9]{6}"
                        maxLength="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={addressData.country}
                        onChange={handleAddressInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (10 digits)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressData.phone}
                      onChange={handleAddressInputChange}
                      pattern="[0-9]{10}"
                      maxLength="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {addressLoading ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAddressEdit}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {user.hasAddress && user.address ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="mt-1 text-gray-900">{user.address.firstName} {user.address.lastName}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-gray-900">{user.address.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <p className="mt-1 text-gray-900">{user.address.street}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <p className="mt-1 text-gray-900">{user.address.city}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <p className="mt-1 text-gray-900">{user.address.state}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Zipcode</label>
                          <p className="mt-1 text-gray-900">{user.address.zipcode}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country</label>
                          <p className="mt-1 text-gray-900">{user.address.country}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="mt-1 text-gray-900">{user.address.phone}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg mb-2">No address on file</p>
                      <p className="text-sm">Add your address to complete your profile and enable faster checkout.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Statistics and Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Account Statistics
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {user.cartData ? Object.keys(user.cartData).length : 0}
                    </div>
                    <div className="text-sm text-gray-600">Cart Items</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {orders.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Account Status</h3>
                  <p className="text-blue-700 text-sm">
                    Your account is active and verified. You can shop, place orders, and manage your profile.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Quick Actions
                </h2>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Navigation</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/orders')}
                      className="block w-full text-left text-green-700 hover:text-green-800 text-sm py-1"
                    >
                      → View Order History
                    </button>
                    <button
                      onClick={() => navigate('/cart')}
                      className="block w-full text-left text-green-700 hover:text-green-800 text-sm py-1"
                    >
                      → View Shopping Cart
                    </button>
                    <button
                      onClick={() => navigate('/collection')}
                      className="block w-full text-left text-green-700 hover:text-green-800 text-sm py-1"
                    >
                      → Continue Shopping
                    </button>
                  </div>
                </div>

                {!user.hasAddress && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Complete Your Profile</h3>
                    <p className="text-yellow-700 text-sm">
                      Add your address to enable faster checkout and complete your profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
