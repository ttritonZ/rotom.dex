import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PageWrapper({ children }) {
  const location = useLocation();
  
  // Routes where navbar is hidden (no top padding needed)
  const hideNavbarRoutes = ['/items/', '/pokedex/', '/character/'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    location.pathname.includes(route) && location.pathname !== route.slice(0, -1)
  );
  
  // If navbar is hidden, don't add top padding
  if (shouldHideNavbar) {
    return <>{children}</>;
  }
  
  // Add top padding to account for fixed navbar
  return (
    <div className="pt-16 lg:pt-20">
      {children}
    </div>
  );
}
