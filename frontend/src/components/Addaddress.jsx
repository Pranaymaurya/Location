import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddressManager = () => {
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate=useNavigate()
  // Token - you can retrieve the token from your localStorage, Context, or Redux state.
  const token = localStorage.getItem('token');  // Assuming token is stored in localStorage
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submit to add a new address
  const handleAddAddress = (e) => {
    e.preventDefault();

    // Post request to add the new address with Bearer token in the header
    axios
      .post(
        'http://localhost:5000/api/v3/addaddress', // Replace with the correct endpoint
        newAddress,
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Passing the token in the Authorization header
          },
        }
      )
      .then((response) => {
        setSuccessMessage('Address added successfully!');
        setError(null);
        setNewAddress({
          label: 'Home',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        });
        navigate("/user")
      })
      .catch((err) => {
        setError('Error adding address');
        setSuccessMessage(null);
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Add New Address</h2>

      {/* Display success or error message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded-md">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-300 rounded-md">
          {error}
        </div>
      )}

      {/* Add Address Form */}
      <form onSubmit={handleAddAddress} className="space-y-4">
        <div>
          <label className="block text-gray-700">Label</label>
          <select
            name="label"
            value={newAddress.label}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Street</label>
          <input
            type="text"
            name="street"
            value={newAddress.street}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={newAddress.city}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">State</label>
          <input
            type="text"
            name="state"
            value={newAddress.state}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={newAddress.postalCode}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={newAddress.country}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md"
        >
          Add Address
        </button>
      </form>
    </div>
  );
};

export default AddressManager;
