import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  dateOfBirth?: string;
  homeAddress?: string;
  isMatricNo_23120112027: boolean;
  registeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  homeAddress?: string;
  isMatricNo_23120112027: boolean;
}

const CustomerForm: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const id = paramId ? parseInt(paramId, 10) : undefined;
  const isEditMode = !!id;

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    homeAddress: '',
    isMatricNo_23120112027: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    if (isEditMode && id) {
      // Now 'id' is number
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/customers/${id}`)
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Unknown error occurred.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: Customer) => {
          const formattedDate = data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split('T')[0]
            : '';
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName || '',
            dateOfBirth: formattedDate,
            homeAddress: data.homeAddress || '',
            isMatricNo_23120112027: data.isMatricNo_23120112027,
          });
        })
        .catch((err) => {
          console.error('Failed to fetch customer for edit:', err);
          setError(`Failed to load customer: ${err.message}. Please try again.`);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = isEditMode ? 'PATCH' : 'POST';
    const url = isEditMode ? `${API_BASE_URL}/customers/${id}` : `${API_BASE_URL}/customers`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Unknown error occurred.' }));
        let errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join('; ');
        }
        throw new Error(errorMessage);
      }

      navigate('/customers');
    } catch (err: unknown) {
      console.error('Failed to save customer:', err);
      if (err instanceof Error) {
        setError(`Failed to save customer: ${err.message}.`);
      } else {
        setError('Failed to save customer: An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p>Loading customer data...</p>;
  if (error && isEditMode) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>{isEditMode ? `Edit Customer (ID: ${id})` : 'Add New Customer'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="middleName">Middle Name (Optional):</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth (Optional):</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="homeAddress">Home Address (Optional):</label>
          <textarea
            id="homeAddress"
            name="homeAddress"
            value={formData.homeAddress || ''}
            onChange={handleChange}
            rows={3}
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Customer' : 'Add Customer'}
        </button>
        <button type="button" onClick={() => navigate('/customers')} disabled={loading}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
