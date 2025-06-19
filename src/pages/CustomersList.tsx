import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Customer {
  id: string;
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

  const API_BASE_URL = 'http://localhost:3000';

  const fetchCustomers = () => {
    setLoading(true);
    setError(null);
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
      .then((data) => setCustomers(data))
      .catch((err) => {
        console.error('Failed to fetch customers:', err);
        setError(`Failed to fetch customers: ${err.message}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      } catch (err: unknown) {
        console.error('Failed to delete customer:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to delete customer: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Customer List</h2>
      <Link to="/customers/new">
        <button>Add New Customer</button>
      </Link>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Middle Name</th>
              <th>Home Address</th>
              <th>Date Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.firstName}</td>
                <td>{customer.lastName}</td>
                <td>{customer.middleName}</td>
                <td>{customer.homeAddress}</td>
                <td>{customer.registeredAt}</td>
                <td className="action-buttons">
                  <Link to={`/customers/edit/${customer.id}`}>
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
