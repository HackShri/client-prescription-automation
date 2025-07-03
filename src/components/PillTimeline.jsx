import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PillTimeline = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddPill, setShowAddPill] = useState(false);
  const [pillName, setPillName] = useState('');
  const [pillTime, setPillTime] = useState('');
  const [pills, setPills] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/pill-schedule', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPills(data.schedule.filter(p => p.date === selectedDate));
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };
    fetchSchedule();
  }, [selectedDate]);

  const addPill = async () => {
    if (!pillName || !pillTime) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        'http://localhost:5000/api/pill-schedule',
        { date: selectedDate, name: pillName, time: pillTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPills(data.schedule.filter(p => p.date === selectedDate));
      setPillName('');
      setPillTime('');
      setShowAddPill(false);
    } catch (error) {
      console.error('Error adding pill:', error);
    }
  };

  const togglePillTaken = async (pillId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.patch(
        `http://localhost:5000/api/pill-schedule/${pillId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPills(data.schedule.filter(p => p.date === selectedDate));
    } catch (error) {
      console.error('Error toggling pill:', error);
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{new Date(selectedDate).toLocaleDateString()}</h3>
        <Button onClick={() => setShowAddPill(true)} size="icon" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {pills.length === 0 ? (
        <p className="text-center text-gray-500">No pills scheduled</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {pills.map(pill => (
            <Card key={pill._id} className="rounded-xl shadow-md p-0 flex flex-col items-center justify-center h-32 w-full">
              <CardContent className="flex flex-col items-center justify-center p-2 h-full w-full">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-700 font-semibold">{pill.time}</span>
                </div>
                <h4 className="font-medium text-center text-base mb-2 truncate w-full">{pill.name}</h4>
                <Button
                  onClick={() => togglePillTaken(pill._id)}
                  size="icon"
                  className={pill.taken ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {showAddPill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full">
            <CardHeader>
              <CardTitle>Add New Pill</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={pillName}
                onChange={(e) => setPillName(e.target.value)}
                placeholder="Medicine Name"
              />
              <Input
                type="time"
                value={pillTime}
                onChange={(e) => setPillTime(e.target.value)}
              />
            </CardContent>
            <div className="flex space-x-3 p-4">
              <Button onClick={addPill} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
              <Button onClick={() => setShowAddPill(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PillTimeline;