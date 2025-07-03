import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { QRCode } from 'react-qr-code';
import io from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import Navbar from '../components/Header';
import PillTimeline from '../components/PillTimeline';
import useSpeechRecognition from '../hooks/useSpeechRecognition.jsx';
import { 
  MessageCircle, 
  QrCode, 
  Mic, 
  MicOff, 
  Clock, 
  Pill, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  X,
  XCircle
} from 'lucide-react';

const socket = io('http://localhost:5000');

const PatientDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    transcript,
    listening,
    startListening,
    stopListening,
  } = useSpeechRecognition();

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
        setIsLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/prescriptions/patient', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrescriptions(data);
      } catch (err) {
        setError('Failed to fetch prescriptions');
      } finally {
        setIsLoading(false);
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

  // Fix QR code overflow by creating a shorter identifier
  const generateQRValue = (prescription) => {
    // Create a shorter, unique identifier to prevent QR code overflow
    const shortId = prescription._id.slice(-8); // Use last 8 characters
    return `RX:${shortId}`; // Much shorter than full JSON
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { status: 'active', icon: Clock, color: 'text-blue-500' };
      case 'completed':
        return { status: 'completed', icon: CheckCircle, color: 'text-green-500' };
      case 'expired':
        return { status: 'expired', icon: XCircle, color: 'text-red-500' };
      default:
        return { status: 'active', icon: Clock, color: 'text-blue-500' };
    }
  };

  return (
    <div className="min-h-screen gradient-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      
      
      <main className="p-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8 slide-in-top">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your prescriptions and health information
          </p>
        </div>

        {notification && (
          <div className="alert-success slide-in-top mb-6">
            <AlertDescription className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {notification}
            </AlertDescription>
          </div>
        )}

        {error && (
          <div className="alert-error slide-in-top mb-6">
            <AlertDescription className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </AlertDescription>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-style hover:scale-105 transition-all duration-300 slide-in-bottom" style={{animationDelay: '0.1s'}}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-primary-hover rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="card-header-style">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full button-style">
                <Link to="/chatbot">Chat with Pharma AI</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-style hover:scale-105 transition-all duration-300 slide-in-bottom" style={{animationDelay: '0.2s'}}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-secondary to-secondary-hover rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="card-header-style">QR Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full button-secondary">
                <Link to="/scanner">Scan Prescription</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-style hover:scale-105 transition-all duration-300 slide-in-bottom" style={{animationDelay: '0.3s'}}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-accent to-accent-hover rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="card-header-style">Voice Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleVoiceCommand} className="w-full button-accent">
                Start Voice Command
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pill Timeline */}
        <div className="mb-8 slide-in-bottom" style={{animationDelay: '0.4s'}}>
          <PillTimeline />
        </div>

        {/* Prescriptions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 slide-in-bottom" style={{animationDelay: '0.5s'}}>
            My Prescriptions
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner w-8 h-8"></div>
              <span className="ml-3 text-muted-foreground">Loading prescriptions...</span>
            </div>
          ) : prescriptions.length === 0 ? (
            <Card className="card-style text-center py-12 slide-in-bottom" style={{animationDelay: '0.6s'}}>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
              <p className="text-muted-foreground">Your prescriptions will appear here once they are issued by your doctor.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {prescriptions.map((prescription, index) => {
                const status = getStatusConfig(prescription.status);
                const StatusIcon = status.icon;
                
                return (
                  <Card 
                    key={prescription._id} 
                    className={`card-style hover:scale-[1.02] transition-all duration-300 slide-in-bottom ${
                      status.status === 'expired' ? 'border-destructive/50' : ''
                    }`}
                    style={{animationDelay: `${0.6 + index * 0.1}s`}}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          <span>Prescription #{prescription._id.slice(-6)}</span>
                        </CardTitle>
                        <span className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 hover:scale-105 ${
                          prescription.status === 'active' 
                            ? 'bg-blue-100 text-blue-800'
                            : prescription.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {prescription.status ? prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Pill className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Medications:</span>
                          </div>
                          <p className="text-sm text-gray-900 pl-6">
                            {prescription.medications.join(', ')}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Usage:</span>
                          </div>
                          <p className="text-sm text-gray-900 pl-6">
                            {prescription.used} / {prescription.usageLimit} times
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Instructions:</span>
                        </div>
                        <p className="text-sm text-gray-900 pl-6">
                          {prescription.instructions}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Expiration Date:</span>
                        </div>
                        <p className="text-sm text-gray-900 pl-6">
                          {new Date(prescription.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {prescription.doctorSignature && (
                        <div className="space-y-2">
                          <span className="font-medium">Doctor Signature:</span>
                          <div className="pl-6">
                            <img 
                              src={prescription.doctorSignature} 
                              alt="Doctor Signature" 
                              className="h-20 border rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-center pt-4">
                        <div className="bg-blue-50 rounded-lg border border-blue-200">
                          <QRCode
                            value={generateQRValue(prescription)}
                            size={150}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Voice Assistant Modal */}
        {showVoiceAssistant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full glass slide-in-bottom">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-accent to-accent-hover rounded-full flex items-center justify-center mb-4">
                  {listening ? (
                    <div className="relative">
                      <Mic className="w-8 h-8 text-white animate-pulse" />
                      <div className="absolute inset-0 w-8 h-8 border-2 border-white rounded-full animate-ping"></div>
                    </div>
                  ) : (
                    <MicOff className="w-8 h-8 text-white" />
                  )}
                </div>
                <CardTitle className="text-xl">Voice Assistant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-sm text-gray-900">
                  {listening ? 'Listening... Speak now!' : 'Tap the button to start speaking'}
                </p>
                {transcript && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-2">You said:</p>
                    <p className="text-sm text-gray-900">{transcript}</p>
                  </div>
                )}
              </CardContent>
              <div className="flex space-x-3 p-6 pt-0">
                <Button 
                  onClick={listening ? stopListening : startListening} 
                  className={`flex-1 ${listening ? 'button-accent' : 'button-style'}`}
                >
                  {listening ? 'Stop Listening' : 'Start Listening'}
                </Button>
                <Button 
                  onClick={handleCloseAssistant} 
                  variant="outline" 
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
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
