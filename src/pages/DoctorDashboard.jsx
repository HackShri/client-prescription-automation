import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCode } from 'react-qr-code';
import SignatureCanvas from 'react-signature-canvas';
import { Mic } from 'lucide-react';
import io from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
//import SignaturePad from 'signature_pad'

const socket = io('http://localhost:5000');

const DoctorDashboard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [prescription, setPrescription] = useState({
    patientEmail: '',
    instructions: '',
    medications: [],
    age: '',
    weight: '',
    height: '',
    usageLimit: 1,
    expiresAt: '',
  });
  const [medicationInput, setMedicationInput] = useState('');
  const [suggestedMedications, setSuggestedMedications] = useState([]);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [signature, setSignature] = useState('');
  const recognitionRef = useRef(null);
  const sigCanvasRef = useRef(null);
  //const padRef = useRef(null);

  // Mock medication suggestions
  useEffect(() => {
    if (prescription.instructions) {
      setSuggestedMedications(['Paracetamol', 'Ibuprofen', 'Amoxicillin']);
    }
  }, [prescription.instructions]);

  // Initialize Web Speech API
  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrescription(prev => ({ ...prev, instructions: transcript }));
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Voice input not supported in this browser');
      return;
    }
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleAddMedication = () => {
    if (medicationInput.trim()) {
      setPrescription(prev => ({
        ...prev,
        medications: [...prev.medications, medicationInput.trim()],
      }));
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (index) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSelectSuggestion = (med) => {
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, med],
    }));
    setMedicationInput('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    //const canvas = sigCanvasRef.current;
    //if (!canvas) return;
//
    //let signaturePadInstance = null; // Rename for clarity
    //const resizeCanvas = () => {
    //  const ratio = Math.max(window.devicePixelRatio || 1, 1);
    //  canvas.width = canvas.offsetWidth * ratio;
    //  canvas.height = canvas.offsetHeight * ratio;
    //  const context = canvas.getContext("2d");
    //  if (context) {
    //    context.scale(ratio, ratio);
    //  }
    //};
//
    //const initializePad = () => {
    //  if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
    //    resizeCanvas();
    //    signaturePadInstance = new SignaturePad(canvas, { // Use the local variable
    //      penColor: "black",
    //      backgroundColor: "white",
    //      onEnd: () => {
    //        const dataURL = signaturePadInstance.toDataURL();
    //        setSignature(dataURL);
    //      },
    //    });
    //    padRef.current = signaturePadInstance; // Update the ref
    //  }
    //};
//
    //if (!padRef.current && canvas.offsetWidth === 0) {
    //  const observer = new ResizeObserver(() => {
    //    if (canvas.offsetWidth > 0) {
    //      initializePad();
    //      observer.disconnect();
    //    }
    //  });
    //  observer.observe(canvas);
    //} else if (!padRef.current && canvas.offsetWidth > 0) {
    //  requestAnimationFrame(initializePad);
    //}
//
//
    //const handleResize = () => {
    //  if (!padRef.current) return;
    //  const data = padRef.current.toData();
    //  resizeCanvas();
    //  if (padRef.current) { // Double check before calling methods
    //    padRef.current.clear();
    //    padRef.current.fromData(data);
    //  }
    //};
//
    //window.addEventListener("resize", handleResize);
//
    return () => {
      //window.removeEventListener("resize", handleResize);
      //if (signaturePadInstance) { // Use the local variable to unbind
      //  signaturePadInstance.off();
      }
    
  }, []);

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignature('');
    }
  };

  const handleEndSignature = () => {
    if (sigCanvasRef.current) {
      setSignature(sigCanvasRef.current.toDataURL());
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!signature) {
      setError('Please provide a digital signature');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      //console.log('Token:', token);
      const user = JSON.parse(atob(token.split('.')[1]));
      const payload = {
        ...prescription,
        age: parseInt(prescription.age) || 0,
        weight: parseFloat(prescription.weight) || 0,
        height: parseFloat(prescription.height) || 0,
        usageLimit: parseInt(prescription.usageLimit) || 1,
        doctorId: user.userId,
        doctorSignature: signature,
      };
      const { data } = await axios.post('http://localhost:5000/api/prescriptions', payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
      },
      withCredentials: true,

      });
      // Emit to patient via Socket.IO
      socket.emit('sendPrescription', {
        patientId: data.patientId,
        prescription: { ...payload, _id: data._id },
      });
      setGeneratedPrescription({ ...payload, _id: data._id });
      setIsCreating(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate prescription');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Doctor Dashboard</h2>
      {!isCreating && !generatedPrescription && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreating(true)} className="w-full">
              Start New Prescription
            </Button>
          </CardContent>
        </Card>
      )}
      {isCreating && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>New Prescription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Patient Email</Label>
                <Input
                  id="patientEmail"
                  name="patientEmail"
                  type="email"
                  placeholder="patient@example.com"
                  value={prescription.patientEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <div className="flex space-x-2">
                  <Input
                    id="instructions"
                    name="instructions"
                    placeholder="Enter instructions"
                    value={prescription.instructions}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceInput}
                    disabled={isListening}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Medications</Label>
                {suggestedMedications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {suggestedMedications.map((med, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectSuggestion(med)}
                      >
                        {med}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add medication"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddMedication}>
                    +
                  </Button>
                </div>
                <ul className="space-y-2 mt-2">
                  {prescription.medications.map((med, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{med}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        ×
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Age"
                    value={prescription.age}
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
                    value={prescription.weight}
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
                    value={prescription.height}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  value={prescription.usageLimit}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  value={prescription.expiresAt}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Digital Signature</Label>
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{
                    className: "border rounded w-full h-32",
                    style: { width: '100%', height: '128px', border: "1px solid #ccc", borderRadius: "6px" },
                  }}
                  onEnd={handleEndSignature}
                />
                <Button type="button" variant="outline" onClick={handleClearSignature}>
                  Clear Signature
                </Button>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Generate Prescription
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      )}
      {generatedPrescription && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generated Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Patient Email:</strong> {generatedPrescription.patientEmail}</p>
            <p><strong>Instructions:</strong> {generatedPrescription.instructions}</p>
            <p><strong>Medications:</strong></p>
            <ul className="list-disc pl-5">
              {generatedPrescription.medications.map((med, index) => (
                <li key={index}>{med}</li>
              ))}
            </ul>
            <p><strong>Age:</strong> {generatedPrescription.age || 'N/A'}</p>
            <p><strong>Weight:</strong> {generatedPrescription.weight || 'N/A'} kg</p>
            <p><strong>Height:</strong> {generatedPrescription.height || 'N/A'} cm</p>
            <p><strong>Usage Limit:</strong> {generatedPrescription.usageLimit}</p>
            <p><strong>Expiration Date:</strong> {new Date(generatedPrescription.expiresAt).toLocaleDateString()}</p>
            <p><strong>Digital Signature:</strong></p>
            <img src={generatedPrescription.doctorSignature} alt="Doctor Signature" className="h-20" />
            
            <div className="flex justify-center">
              <QRCode
                value={JSON.stringify({
                  prescriptionId: generatedPrescription._id,
                  patientEmail: generatedPrescription.patientEmail,
                })}
                size={200}
              />

            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setGeneratedPrescription(null)} className="w-full">
              Create Another
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default DoctorDashboard;