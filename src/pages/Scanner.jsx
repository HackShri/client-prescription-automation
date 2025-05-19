import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const Scanner = () => {
  const [scannedPrescription, setScannedPrescription] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

  useEffect(() => {
    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if(videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQR();
        }
      } catch (err) {
        setError('Failed to access camera');
      }
    };

    const scanQR = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
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
          } catch (err) {
            setError('Invalid QR code');
          }
        }
      }
      requestAnimationFrame(scanQR);
    };

    const delayScanner = setTimeout(() => {
    startScanner();
  }, 2000);

    return () => {
      clearTimeout(delayScanner);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchPrescription = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/api/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScannedPrescription(data);
    } catch (err) {
      setError('Failed to fetch prescription');
    }
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
          <CardTitle>Scan Prescription QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <video ref={videoRef} className="w-full" />
          {scannedPrescription && (
            <div className="mt-4 space-y-2">
              <p><strong>Patient Email:</strong> {scannedPrescription.patientEmail}</p>
              <p><strong>Instructions:</strong> {scannedPrescription.instructions}</p>
              <p><strong>Medications:</strong> {scannedPrescription.medications.join(', ')}</p>
              <p><strong>Usage:</strong> {scannedPrescription.used} / {scannedPrescription.usageLimit}</p>
              <p><strong>Expiration Date:</strong> {new Date(scannedPrescription.expiresAt).toLocaleDateString()}</p>
              <p><strong>Doctor Signature:</strong></p>
              <img src={scannedPrescription.doctorSignature} alt="Doctor Signature" className="h-20" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;