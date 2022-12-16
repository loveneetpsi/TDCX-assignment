import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shell from './components/Shell'
import Login from './container/Login'
import Dashboard from './container/Dashboard'
import ErrorPage from './container/ErrorPage'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
    <Shell>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </Shell>
    <ToastContainer/>
    </>

  );
}

export default App;
