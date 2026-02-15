import { useState } from 'react';
import { ActivityType } from '../models/Activity';
import type { ActivityManager } from '../services/ActivityManager';

interface ActivityFormProps {
  activityManager: ActivityManager;
  onSuccess?: () => void;
}

export function ActivityForm({ activityManager, onSuccess }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>(ActivityType.Running);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const result = await activityManager.createActivity({
      type,
      date: new Date(date),
      duration: Number(duration),
      distance: Number(distance),
      calories: Number(calories),
    });

    if (result.success) {
      setSuccess(true);
      setDuration('');
      setDistance('');
      setCalories('');
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Log Activity</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>Activity logged!</div>}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Activity Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as ActivityType)}
          style={{ width: '100%', padding: '8px' }}
        >
          <option value={ActivityType.Running}>Running</option>
          <option value={ActivityType.Cycling}>Cycling</option>
          <option value={ActivityType.Swimming}>Swimming</option>
          <option value={ActivityType.Walking}>Walking</option>
          <option value={ActivityType.StrengthTraining}>Strength Training</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
          min="1"
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Distance (km)</label>
        <input
          type="number"
          step="0.01"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
          min="0"
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Calories</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          style={{ width: '100%', padding: '8px' }}
          min="0"
          required
        />
      </div>

      <button 
        type="submit"
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Log Activity
      </button>
    </form>
  );
}
