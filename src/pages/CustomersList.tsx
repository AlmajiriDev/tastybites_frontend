// src/pages/CustomersList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Define the shape of customer data (matching Prisma Customer model)
interface Customer {
  id: number; // Changed from string to number to reflect serial IDs from backend
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  dateOfBirth?: string;
  homeAddress?: string;
  isMatricNo_23120112027: boolean;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000'; // Your NestJS backend URL

  // Function to fetch customers from the API
  const fetchCustomers = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/customers`)
      .then(async (response) => {
        if (!response.ok) {
          // Attempt to read JSON error message from backend
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setCustomers(data))
      .catch((err) => {
        console.error('Failed to fetch customers:', err); // Log full error for debugging
        setError(`Failed to fetch customers: ${err.message}. Please try again.`); // Display user-friendly message
      })
      .finally(() => setLoading(false));
  };

  // useEffect hook to fetch customers when the component mounts
  useEffect(() => {
    fetchCustomers();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle deleting a customer
  const handleDelete = async (id: number) => {
    // id is now number
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
          // id used in URL, will be stringified automatically
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // Remove the deleted customer from the local state to update UI
        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      } catch (err: unknown) {
        // Use 'unknown' for type safety
        console.error('Failed to delete customer:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to delete customer: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Render loading state
  if (loading) return <p>Loading customers...</p>;
  // Render error state
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  // Main component render
  return (
    <div>
      <h2>Customer List</h2>
      <Link to="/customers/new">
        <button>Add New Customer</button>
      </Link>

      {/* Conditional rendering based on whether customers exist */}
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Middle Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.firstName}</td>
                <td>{customer.lastName}</td>
                <td>{customer.middleName}</td>
                <td className="action-buttons">
                  <Link to={`/customers/edit/${customer.id}`}>
                    {' '}
                    {/* id used in URL, will be stringified */}
                    <button>Edit</button>
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(customer.id)}
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

export default CustomersList;
