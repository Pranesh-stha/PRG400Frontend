import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import MyBookings from './pages/MyBookings';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import Search from './pages/Search';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="property/:id" element={<PropertyDetail />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="host" element={<HostDashboard />} />
        <Route path="host/properties/new" element={<PropertyForm />} />
        <Route path="host/properties/:id/edit" element={<PropertyForm />} />
      </Route>
    </Routes>
  );
}
