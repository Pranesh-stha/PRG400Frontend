import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Search from './pages/Search';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="property/:id" element={<PropertyDetail />} />
      </Route>
    </Routes>
  );
}
