import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCode } from 'react-qr-code';
import io from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import PillTimeline from '../components/PillTimeline';
import useSpeechRecognition from '../hooks/useSpeechRecognition.jsx'; // ✅ Custom hook

const socket = io('http://localhost:5000');

const PatientDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const {
    transcript,
    listening,
    startListening,
    stopListening,
  } = useSpeechRecognition(); // ✅ Use custom hook

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
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

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    setShowVoiceAssistant(true);
    startListening();
  };

  const handleCloseAssistant = () => {
    stopListening();
    setShowVoiceAssistant(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/chatbot">Pharma AI Chat</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/scanner">Scan QR Code</Link>
              </Button>
              <Button onClick={handleVoiceCommand} className="w-full">
                Voice Assistant
              </Button>
            </CardContent>
          </Card>
        </div>

        <PillTimeline />

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

        {showVoiceAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-sm w-full">
              <CardHeader>
                <CardTitle>Voice Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{listening ? 'Listening...' : 'Tap to speak'}</p>
                {transcript && <p className="p-4 bg-blue-50 rounded-md">{transcript}</p>}
              </CardContent>
              <div className="flex space-x-3 p-4">
                <Button onClick={listening ? stopListening : startListening} className="flex-1">
                  {listening ? 'Stop' : 'Start Listening'}
                </Button>
                <Button onClick={handleCloseAssistant} variant="outline" className="flex-1">
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
