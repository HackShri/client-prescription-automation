import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu, User, LogOut, Home, LayoutDashboard } from 'lucide-react';
import Headroom from 'react-headroom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient': return '👤';
      case 'doctor': return '👨‍⚕️';
      case 'pharmacist': return '💊';
      case 'admin': return '🔧';
      default: return '👤';
    }
  };

  return (
    <Headroom style={{ position: 'fixed', zIndex: 50, width: '100%' }}>
      <header className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-4 hover:bg-gray-100 rounded-xl">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white/95 backdrop-blur-md">
                  <SheetHeader>
                    <SheetTitle className="gradient-text text-2xl font-bold">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8">
                    <ul className="space-y-4">
                      <li>
                        <Link 
                          to="/" 
                          className="nav-link flex items-center space-x-3 text-lg" 
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-5 w-5" />
                          <span>Home</span>
                        </Link>
                      </li>
                      {user && (
                        <li>
                          <Link 
                            to="/dashboard" 
                            className="nav-link flex items-center space-x-3 text-lg" 
                            onClick={() => setIsOpen(false)}
                          >
                            <LayoutDashboard className="h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                        </li>
                      )}
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💊</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">
                  Prescription Integrity
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full">
                    <span className="text-lg">{getRoleIcon(user.role)}</span>
                    <span className="text-sm font-medium capitalize text-gray-700">{user.role}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="button-secondary"
                    onClick={() => { logout(); navigate('/'); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="button-secondary"
                    onClick={() => navigate('/login')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    className="button-style"
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </Headroom>
  );
};

export default Navbar;