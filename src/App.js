import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell'
import Login from './container/Login'
import Dashboard from './container/Dashboard'
import ErrorPage from './container/ErrorPage'


function App() {
  return (
    <Shell>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </Shell>
  );
}

export default App;
