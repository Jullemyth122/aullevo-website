import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import Documentation from './pages/Documentation';
import About from './pages/About';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Advertising from './pages/Advertising';
import { GuidesIndex, GuideArticle } from './pages/Guides';
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
        { path: 'privacy', element: <PrivacyPolicy /> },
        { path: 'terms', element: <TermsOfService /> },
        { path: 'contact', element: <Contact /> },
        { path: 'advertising', element: <Advertising /> },
        { path: 'guides', element: <GuidesIndex /> },
        { path: 'guides/:slug', element: <GuideArticle /> },
        { path: 'admin', element: <Admin /> },
        // Ad-based passes have ended; old links from the extension land on the plans page
        { path: 'rewards', element: <Navigate to="/login" replace /> },
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


