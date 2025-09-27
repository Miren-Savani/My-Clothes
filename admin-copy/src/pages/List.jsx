import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { currency, assets } from '../App';
import ConfirmationDialog from '../components/ConfirmationDialog';

// Make sure backendUrl is imported or defined properly
import { backendUrl } from '../App';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Men',
    subCategory: 'Topwear',
    bestseller: 'false',
    sizes: []
  });
  const [editImages, setEditImages] = useState({
    image1: false,
    image2: false,
    image3: false,
    image4: false
  });

  const fetchList = async () => {
    try {
      console.log('Fetching from URL:', backendUrl + '/api/product/list');
      console.log('Using token:', token);

      const response = await axios.get(backendUrl + '/api/product/list', {
        headers: { token }
      });

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Network Error');
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowConfirmDialog(true);
  };

  const removeProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id: productToDelete._id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Network Error');
    } finally {
      setShowConfirmDialog(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setProductToDelete(null);
  };

  const handleEditClick = async (product) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/single',
        { productId: product._id },
        { headers: { token } }
      );

      if (response.data.success) {
        const productData = response.data.product;
        setProductToEdit(productData);
        setEditForm({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          category: productData.category,
          subCategory: productData.subCategory || 'Topwear',
          bestseller: productData.bestseller ? 'true' : 'false',
          sizes: productData.sizes || []
        });
        setEditImages({
          image1: false,
          image2: false,
          image3: false,
          image4: false
        });
        setShowEditModal(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Network Error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('id', productToEdit._id);
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);
      formData.append('subCategory', editForm.subCategory);
      formData.append('bestseller', editForm.bestseller);
      formData.append('sizes', JSON.stringify(editForm.sizes));

      // Only append images if they are selected
      editImages.image1 && formData.append('image1', editImages.image1);
      editImages.image2 && formData.append('image2', editImages.image2);
      editImages.image3 && formData.append('image3', editImages.image3);
      editImages.image4 && formData.append('image4', editImages.image4);

      const response = await axios.post(
        backendUrl + '/api/product/update',
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
        setShowEditModal(false);
        setProductToEdit(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Network Error');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setProductToEdit(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      category: 'Men',
      subCategory: 'Topwear',
      bestseller: 'false',
      sizes: []
    });
    setEditImages({
      image1: false,
      image2: false,
      image3: false,
      image4: false
    });
  };

  // Run fetchList once on component mount
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All products List</p>
      <div>
        {/* List table header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Actions</b>
        </div>

        {/* Product list */}
        {list.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <img className="w-14" src={item.image[0]} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleEditClick(item)}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(item)}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDelete}
        onConfirm={removeProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            
            <form onSubmit={handleEditSubmit} className='flex flex-col w-full items-start gap-3'>
              <div>
                <p className='mb-2'>Upload New Images (Optional)</p>
                <div className='flex gap-2'>
                  <label htmlFor='edit_image1'>
                    <img className='w-20' src={!editImages.image1 ? assets.upload_area : URL.createObjectURL(editImages.image1)} alt='' />
                    <input onChange={(e) => setEditImages(prev => ({...prev, image1: e.target.files[0]}))} type='file' id='edit_image1' hidden/>
                  </label>
                  <label htmlFor='edit_image2'>
                    <img className='w-20' src={!editImages.image2 ? assets.upload_area : URL.createObjectURL(editImages.image2)} alt='' />
                    <input onChange={(e) => setEditImages(prev => ({...prev, image2: e.target.files[0]}))} type='file' id='edit_image2' hidden/>
                  </label>
                  <label htmlFor='edit_image3'>
                    <img className='w-20' src={!editImages.image3 ? assets.upload_area : URL.createObjectURL(editImages.image3)} alt='' />
                    <input onChange={(e) => setEditImages(prev => ({...prev, image3: e.target.files[0]}))} type='file' id='edit_image3' hidden/>
                  </label>
                  <label htmlFor='edit_image4'>
                    <img className='w-20' src={!editImages.image4 ? assets.upload_area : URL.createObjectURL(editImages.image4)} alt='' />
                    <input onChange={(e) => setEditImages(prev => ({...prev, image4: e.target.files[0]}))} type='file' id='edit_image4' hidden/>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">Current images will be replaced if new ones are selected</p>
              </div>

              <div className='w-full'>
                <p className='mb-2'>Product Name</p>
                <input 
                  onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))} 
                  value={editForm.name} 
                  className='w-full max-w-[500px] px-3 py-2 border rounded' 
                  type='text' 
                  placeholder='Type Here' 
                  required 
                />
              </div>

              <div className='w-full'>
                <p className='mb-2'>Product Description</p>
                <textarea 
                  onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))} 
                  value={editForm.description} 
                  className='w-full max-w-[500px] px-3 py-2 border rounded' 
                  placeholder='Add Description Here' 
                  required 
                />
              </div>

              <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                  <p className='mb-2'>Product Category</p>
                  <select 
                    onChange={(e) => setEditForm(prev => ({...prev, category: e.target.value}))} 
                    value={editForm.category}
                    className='w-full px-3 py-2 border rounded'
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
                <div>
                  <p className='mb-2'>Sub Category</p>
                  <select 
                    onChange={(e) => setEditForm(prev => ({...prev, subCategory: e.target.value}))} 
                    value={editForm.subCategory}
                    className='w-full px-3 py-2 border rounded'
                  >
                    <option value="Topwear">Topwear</option>
                    <option value="Bottomwear">Bottomwear</option>
                    <option value="Winterwear">Winterwear</option>
                  </select>
                </div>
                <div>
                  <p className='mb-2'>Product Price</p>
                  <input 
                    onChange={(e) => setEditForm(prev => ({...prev, price: e.target.value}))} 
                    value={editForm.price} 
                    className='w-full px-3 py-2 border rounded sm:w-[120px]' 
                    type='Number' 
                    placeholder='99' 
                    required
                  />
                </div>
              </div>

              <div>
                <p className='mb-2'>Product Sizes</p>
                <div className='flex gap-3'>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size} onClick={() => setEditForm(prev => ({
                      ...prev,
                      sizes: prev.sizes.includes(size) 
                        ? prev.sizes.filter(item => item !== size)
                        : [...prev.sizes, size]
                    }))}>
                      <p className={`${editForm.sizes.includes(size) ? 'bg-pink-200' : 'bg-slate-200'} px-3 py-1 cursor-pointer rounded`}>
                        {size}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex gap-2 mt-2'>
                <input 
                  onChange={() => setEditForm(prev => ({...prev, bestseller: prev.bestseller === 'true' ? 'false' : 'true'}))} 
                  checked={editForm.bestseller === 'true'} 
                  type='checkbox' 
                  id='edit_bestseller' 
                />
                <label className='cursor-pointer' htmlFor='edit_bestseller'>Add to Best-Seller</label>
              </div>

              <div className="flex gap-3 mt-4">
                <button type='submit' className='px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'>
                  Update Product
                </button>
                <button 
                  type='button' 
                  onClick={handleCancelEdit}
                  className='px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
