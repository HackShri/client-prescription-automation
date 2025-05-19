import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      

      <main className="container mx-auto py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">Secure Prescription Management</h2>
            <p className="text-xl text-gray-600">
              Ensuring the integrity and authenticity of medical prescriptions through secure digital verification.
            </p>
            <div className="flex gap-4">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>For Doctors</CardTitle>
                <CardDescription>Create and manage digital prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Issue tamper-proof prescriptions and monitor patient medication adherence in real-time.</p>
              </CardContent>
              <CardFooter>
                <Link to="/signup?role=doctor" className="w-full">
                  <Button className="w-full">Register as Doctor</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Patients</CardTitle>
                <CardDescription>Access your prescriptions securely</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View your prescriptions, receive medication reminders, and share securely with pharmacies.</p>
              </CardContent>
              <CardFooter>
                <Link to="/signup?role=patient" className="w-full">
                  <Button className="w-full">Register as Patient</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Pharmacies</CardTitle>
                <CardDescription>Verify prescription authenticity</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Easily verify the authenticity of prescriptions and maintain digital records.</p>
              </CardContent>
              <CardFooter>
                <Link to="/signup?role=shop" className="w-full">
                  <Button className="w-full">Register as Pharmacy</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blockchain Secured</CardTitle>
                <CardDescription>Immutable prescription records</CardDescription>
              </CardHeader>
              <CardContent>
                <p>All prescriptions are secured using blockchain technology to prevent tampering and fraud.</p>
              </CardContent>
              <CardFooter>
                <Link to="/about#technology" className="w-full">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto">
          <p className="text-center text-sm text-gray-500">© 2025 Prescription Integrity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
