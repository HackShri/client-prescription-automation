import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import Headroom from 'react-headroom';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <Headroom
      style={{
        position: 'fixed',
        zIndex: 50,
        width: '100%',
      }}
    >
      <header className="w-full bg-card shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-4">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6">
                    <ul className="space-y-4">
                      <li>
                        <Link to="/" className="text-lg hover:underline" onClick={() => setIsOpen(false)}>
                          Home
                        </Link>
                      </li>
                      {user && (
                        <li>
                          <Link to="/dashboard" className="text-lg hover:underline" onClick={() => setIsOpen(false)}>
                            Dashboard
                          </Link>
                        </li>
                      )}
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">
                <Link to="/">Prescription App</Link>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm capitalize text-foreground">{user.role}</span>
                  <Button variant="outline" onClick={() => { logout(); navigate('/'); }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')}>
                    Sign Up
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