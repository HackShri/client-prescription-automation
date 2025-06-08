import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    secretCode: '',
    age: '',
    weight: '',
    height: '',
    photo: null,
  });
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setForm({ ...form, photo: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadMessage('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        secretCode: form.secretCode,
      };

      if (form.role === 'patient') {
        payload.age = parseInt(form.age) || undefined;
        payload.weight = parseFloat(form.weight) || undefined;
        payload.height = parseFloat(form.height) || undefined;
      }

      if (form.role === 'admin' && !form.secretCode) {
        throw new Error('Secret code is required for admin signup');
      }

      // Complete signup
      const { data } = await axios.post('http://localhost:5000/api/auth/signup', payload);
      const token = data.token;
      login(token);

      // Upload photo if patient
      if (form.role === 'patient' && form.photo) {
        const formData = new FormData();
        formData.append('photo', form.photo);
        formData.append('email', form.email);

        const uploadResponse = await axios.post('http://localhost:5000/api/auth/upload-photo', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadMessage(uploadResponse.data.message);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to manage your prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="shop">Medical Shop Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="secretCode">Secret Code</Label>
                <Input
                  id="secretCode"
                  name="secretCode"
                  type="text"
                  placeholder="Enter secret code"
                  value={form.secretCode}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {form.role === 'patient' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="Weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="Height"
                    value={form.height}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Passport Photo</Label>
                  <Input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="input-style"
                  />
                </div>
              </>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {uploadMessage && (
              <Alert className={uploadMessage.includes('Error') ? 'border-destructive' : ''}>
                <AlertDescription>{uploadMessage}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full button-style">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <a href="/login" className="text-sm text-primary hover:underline">
            Already have an account? Login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;