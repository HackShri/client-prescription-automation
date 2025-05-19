import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {QRCode} from 'react-qr-code';
import io from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const socket = io('http://localhost:5000');

const PatientDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(atob(token.split('.')[1]));
    socket.emit('joinRoom', user.userId);

    socket.on('receivePrescription', (prescription) => {
      setNotification('New prescription received!');
      setPrescriptions(prev => [...prev, prescription]);
      setTimeout(() => setNotification(''), 5000);
    });

    const fetchPrescriptions = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/prescriptions/patient', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrescriptions(data);
      } catch (err) {
        setError('Failed to fetch prescriptions');
      }
    };
    fetchPrescriptions();

    return () => socket.off('receivePrescription');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Patient Dashboard</h2>
      {notification && (
        <Alert className="mb-6">
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button asChild className="mb-6">
        <a href="/scanner">Scan QR Code</a>
      </Button>
      {prescriptions.length === 0 ? (
        <p className="text-center text-muted-foreground">No prescriptions found</p>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map(p => (
            <Card key={p._id} className={new Date(p.expiresAt) < new Date() ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle>Prescription</CardTitle>
                {new Date(p.expiresAt) < new Date() && (
                  <p className="text-destructive text-sm">Expired</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Instructions:</strong> {p.instructions}</p>
                <p><strong>Medications:</strong> {p.medications.join(', ')}</p>
                <p><strong>Usage:</strong> {p.used} / {p.usageLimit}</p>
                <p><strong>Expiration Date:</strong> {new Date(p.expiresAt).toLocaleDateString()}</p>
                <p><strong>Doctor Signature:</strong></p>
                <img src={p.doctorSignature} alt="Doctor Signature" className="h-20" />
                <div className="flex justify-center">
                  <QRCode
                    value={JSON.stringify({
                      prescriptionId: p._id,
                      patientEmail: p.patientEmail,
                      
                    })}
                    size={200}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;