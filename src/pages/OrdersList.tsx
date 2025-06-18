// src/pages/OrdersList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define the shape of Customer within an Order (as included by Prisma)
interface OrderCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  // ... other customer fields you might want to display, but keep it minimal for a list
}

// Define the shape of Order data (matching Prisma Order model, with included customer)
interface Order {
  id: string;
  customerId: string;
  customer: OrderCustomer; // The nested customer object from the backend
  orderDate: string; // From Table 2: a. Order date (as string from API)
  menuItems: string[]; // List of menu item names as strings
  specialInstructions?: string;
  paymentMethod?: string;
  nextReservationDate?: string; // Optional, as string from API
  createdAt: string;
  updatedAt: string;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000'; // Your NestJS backend URL

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/orders`)
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
        setError(`Failed to fetch orders: ${err.message}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []); // Empty dependency array means this runs once on mount

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // Remove the deleted order from the local state
        setOrders((prev) => prev.filter((order) => order.id !== id));
      } catch (err: unknown) {
        console.error('Failed to delete order:', err);
        let errorMessage = 'An unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(`Failed to delete order: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Order List</h2>
      <Link to="/orders/new">
        <button>Create New Order</button>
      </Link>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Menu Items</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : 'N/A'}
                </td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>{order.menuItems.join(', ')}</td>
                <td>{order.paymentMethod || 'N/A'}</td>
                <td className="action-buttons">
                  <Link to={`/orders/edit/${order.id}`}>
                    <button>Edit</button>
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(order.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersList;
