import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctorsAndShops = data.filter(user => ['doctor', 'shop'].includes(user.role));
        setPendingUsers(doctorsAndShops.filter(user => !user.verified));
        setVerifiedUsers(doctorsAndShops.filter(user => user.verified));
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleVerify = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/verify/${userId}`, { action }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      if (action === 'accept') {
        const user = pendingUsers.find(user => user._id === userId);
        setVerifiedUsers([...verifiedUsers, { ...user, verified: true }]);
      }
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to process verification');
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h2>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <p className="text-muted-foreground">No pending requests</p>
            ) : (
              <ul className="space-y-4">
                {pendingUsers.map(user => (
                  <li key={user._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{user.name} ({user.role})</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={() => viewUserDetails(user)}>
                      View Details
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verified Doctors & Shops</CardTitle>
          </CardHeader>
          <CardContent>
            {verifiedUsers.length === 0 ? (
              <p className="text-muted-foreground">No verified users</p>
            ) : (
              <ul className="space-y-4">
                {verifiedUsers.map(user => (
                  <li key={user._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{user.name} ({user.role})</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button variant="outline" onClick={() => viewUserDetails(user)}>
                      View Details
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Verified:</strong> {selectedUser.verified ? 'Yes' : 'No'}</p>
            {selectedUser.createdAt && (
              <p><strong>Registered:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            )}
            {!selectedUser.verified && (
              <div className="flex space-x-4 mt-4">
                <Button onClick={() => handleVerify(selectedUser._id, 'accept')}>
                  Accept
                </Button>
                <Button variant="destructive" onClick={() => handleVerify(selectedUser._id, 'reject')}>
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;