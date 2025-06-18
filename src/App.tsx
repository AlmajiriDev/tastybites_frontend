import CustomersList from './pages/CustomersList';
import CustomerForm from './pages/CustomerForm';
import OrdersList from './pages/OrdersList';
import OrderForm from './pages/OrderForm';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>TastyBites</span>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/orders">Orders</NavLink>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<CustomersList />} /> {/* Default route */}
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/edit/:id" element={<OrderForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
