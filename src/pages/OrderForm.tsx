import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface OrderFormData {
  customerId: string;
  orderDate?: string;
  menuItems: string;
  specialInstructions?: string;
  paymentMethod?: string;
  nextReservationDate?: string;
}

const OrderForm: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const id = paramId;
  const isEditMode = !!id;

  const [formData, setFormData] = useState<OrderFormData>({
    customerId: '',
    menuItems: '',
    orderDate: '',
    specialInstructions: '',
    paymentMethod: '',
    nextReservationDate: '',
  });

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customersLoading, setCustomersLoading] = useState<boolean>(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    setCustomersLoading(true);
    setCustomersError(null);
    fetch(`${API_BASE_URL}/customers`)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: CustomerOption[]) => {
        setCustomers(data);

        if (!isEditMode && data.length > 0 && formData.customerId === '') {
          setFormData((prev) => ({ ...prev, customerId: data[0].id }));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch customers for dropdown:', err);
        setCustomersError(`Failed to load customers: ${err.message}.`);
      })
      .finally(() => setCustomersLoading(false));
  }, [isEditMode, formData.customerId]);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE_URL}/orders/${id}`)
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Unknown error occurred.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const formattedOrderDate = data.orderDate
            ? new Date(data.orderDate).toISOString().split('T')[0]
            : '';
          const formattedReservationDate = data.nextReservationDate
            ? new Date(data.nextReservationDate).toISOString().split('T')[0]
            : '';

          setFormData({
            customerId: data.customerId || '',
            menuItems: Array.isArray(data.menuItems) ? data.menuItems.join(', ') : '',
            orderDate: formattedOrderDate,
            specialInstructions: data.specialInstructions || '',
            paymentMethod: data.paymentMethod || '',
            nextReservationDate: formattedReservationDate,
          });
        })
        .catch((err) => {
          console.error('Failed to fetch order for edit:', err);
          setError(`Failed to load order: ${err.message}. Please try again.`);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = isEditMode ? 'PATCH' : 'POST';
    const url = isEditMode ? `${API_BASE_URL}/orders/${id}` : `${API_BASE_URL}/orders`;

    const dataToSend = {
      ...formData,
      menuItems: formData.menuItems
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== ''),
      orderDate: formData.orderDate ? new Date(formData.orderDate) : undefined,
      nextReservationDate: formData.nextReservationDate
        ? new Date(formData.nextReservationDate)
        : undefined,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
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

      navigate('/orders');
    } catch (err: unknown) {
      console.error('Failed to save order:', err);
      let errorMessage = 'An unknown error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(`Failed to save order: ${errorMessage}.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p>Loading order data...</p>;
  if (customersLoading) return <p>Loading customers for selection...</p>;
  if (error && isEditMode) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (customersError) return <p style={{ color: 'red' }}>Error: {customersError}</p>;

  return (
    <div>
      <h2>{isEditMode ? `Edit Order (ID: ${id})` : 'Create New Order'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {customersError && <p style={{ color: 'red' }}>{customersError}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="customerId">Customer:</label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            disabled={customersLoading} // Disable until customers are loaded
          >
            <option value="">Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.firstName} {customer.lastName} ({customer.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="menuItems">Menu Items (comma-separated):</label>
          <textarea
            id="menuItems"
            name="menuItems"
            value={formData.menuItems}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Burger, Fries, Coke"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="orderDate">Order Date (Optional):</label>
          <input
            type="date"
            id="orderDate"
            name="orderDate"
            value={formData.orderDate || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="specialInstructions">Special Instructions (Optional):</label>
          <textarea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions || ''}
            onChange={handleChange}
            rows={2}
          ></textarea>
        </div>
        <div>
          <label htmlFor="paymentMethod">Payment Method (Optional):</label>
          <input
            type="text"
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="nextReservationDate">Next Reservation Date (Optional):</label>
          <input
            type="date"
            id="nextReservationDate"
            name="nextReservationDate"
            value={formData.nextReservationDate || ''}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={loading || customersLoading}>
          {loading ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
        </button>
        <button type="button" onClick={() => navigate('/orders')} disabled={loading}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
