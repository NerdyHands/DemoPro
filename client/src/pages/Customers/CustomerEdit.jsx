import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout.jsx';
import { customerApi } from '../../services/contractsApi';
import './CustomerEdit.css';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isBusiness, setIsBusiness] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerApi.getCustomer(id);
      const customer = response.customer;
      
      // Determine if this is a business or person based on existing data
      const hasBusinessName = customer.businessName && customer.businessName.trim().length > 0;
      setIsBusiness(hasBusinessName);
      
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        businessName: customer.businessName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address?.full || '',
        notes: customer.notes || ''
      });
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      fetchCustomer();
    }
  }, [isEditing, fetchCustomer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isBusiness) {
      if (!formData.businessName.trim()) {
        setError('Business name is required');
        return false;
      }
    } else {
      if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data based on toggle state
      const submitData = {
        ...formData,
        email: formData.email,
        phone: formData.phone || '',
        address: formData.address,
        notes: formData.notes || ''
      };

      // Only include the relevant name fields based on toggle
      if (isBusiness) {
        submitData.businessName = formData.businessName;
        delete submitData.firstName;
        delete submitData.lastName;
      } else {
        submitData.firstName = formData.firstName;
        submitData.lastName = formData.lastName;
        delete submitData.businessName;
      }

      if (isEditing) {
        await customerApi.updateCustomer(id, submitData);
        setSuccess('Customer updated successfully!');
      } else {
        await customerApi.createCustomer(submitData);
        setSuccess('Customer created successfully!');
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.response?.data?.error || 'Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="customer-edit-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading customer data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="customer-edit-container">
        <div className="customer-edit-header">
          <h1 className="customer-edit-title">
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </h1>
          <p className="customer-edit-subtitle">
            {isEditing ? 'Update customer information' : 'Create a new customer record'}
          </p>
        </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {success && (
        <div className="success-container">
          <p className="success-message">{success}</p>
        </div>
      )}

      <div className="customer-edit-content">
        <form onSubmit={handleSubmit} className="customer-form">
          {/* Toggle Switch */}
          <div className="form-group">
            <div className="name-type-toggle">
              <label className="toggle-label">Customer Type:</label>
              <div className="toggle-switch">
                <button
                  type="button"
                  className={`toggle-option ${!isBusiness ? 'active' : ''}`}
                  onClick={() => {
                    setIsBusiness(false);
                    setFormData(prev => ({ ...prev, businessName: '' }));
                    setError('');
                  }}
                >
                  Person
                </button>
                <button
                  type="button"
                  className={`toggle-option ${isBusiness ? 'active' : ''}`}
                  onClick={() => {
                    setIsBusiness(true);
                    setFormData(prev => ({ ...prev, firstName: '', lastName: '' }));
                    setError('');
                  }}
                >
                  Business
                </button>
              </div>
            </div>
          </div>

          {/* Name Fields - Conditional based on toggle */}
          {isBusiness ? (
            <div className="form-group">
              <label htmlFor="businessName" className="form-label">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter business name"
                required={isBusiness}
              />
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter first name"
                  required={!isBusiness}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter last name"
                  required={!isBusiness}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter full address"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter any additional notes"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </Layout>
  );
};

export default CustomerEdit;
