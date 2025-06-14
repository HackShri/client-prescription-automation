import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { QrCode } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Scanner = () => {
  const [scannedPrescription, setScannedPrescription] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let animationFrameId;

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          scanQR();
        }
      } catch (err) {
        setError('Failed to access camera. Please grant permission or try another device.');
      }
    };

    const scanQR = () => {
      if (!isScanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          try {
            const data = JSON.parse(code.data);
            fetchPrescription(data.prescriptionId);
            setIsScanning(false); // Stop scanning after success
          } catch (err) {
            setError('Invalid QR code format');
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanQR);
    };

    const delayScanner = setTimeout(() => {
      startScanner();
    }, 2000);

    return () => {
      clearTimeout(delayScanner);
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning]);

  const fetchPrescription = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScannedPrescription(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prescription');
    }
  };

  const resetScanner = () => {
    setScannedPrescription(null);
    setError('');
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">QR Code Scanner</h2>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-6 h-6" />
            <span>Scan Prescription QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isScanning && <video ref={videoRef} className="w-full rounded-md" />}
          {scannedPrescription && (
            <div className="mt-4 space-y-2">
              <p><strong>Patient Email:</strong> {scannedPrescription.patientEmail}</p>
              <p><strong>Instructions:</strong> {scannedPrescription.instructions}</p>
              <p><strong>Medications:</strong> {scannedPrescription.medications.join(', ')}</p>
              <p><strong>Usage:</strong> {scannedPrescription.used} / {scannedPrescription.usageLimit}</p>
              <p><strong>Expiration Date:</strong> {new Date(scannedPrescription.expiresAt).toLocaleDateString()}</p>
              <p><strong>Doctor Signature:</strong></p>
              <img src={scannedPrescription.doctorSignature} alt="Doctor Signature" className="h-20" />
              <Button onClick={resetScanner} className="mt-4 w-full">
                Scan Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;