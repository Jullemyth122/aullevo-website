import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Documentation from './pages/Documentation';
import About from './pages/About';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import './styles/main.scss';


const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'features', element: <Features /> },
        { path: 'how-it-works', element: <HowItWorks /> },
        { path: 'docs', element: <Documentation /> },
        { path: 'about', element: <About /> },
        { path: 'login', element: <Login /> },
      ],
    },
  ])

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;


