import { useState, useEffect } from 'react';
import { ActivityForm } from './components/ActivityForm';
import { IndexedDBStorage } from './services/IndexedDBStorage';
import { ActivityManager } from './services/ActivityManager';
import { formatDate, formatDuration, formatDistance, formatCalories, formatActivityType } from './utils/formatters';
import type { Activity } from './models/Activity';
import './App.css';

const storage = new IndexedDBStorage();
const activityManager = new ActivityManager(storage);

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    const result = await activityManager.getAllActivities();
    if (result.success) {
      setActivities(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this activity?')) {
      await activityManager.deleteActivity(id);
      loadActivities();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Fitness Tracker</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <ActivityForm activityManager={activityManager} onSuccess={loadActivities} />
      </div>

      <div>
        <h2>Activity History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : activities.length === 0 ? (
          <p>No activities yet. Log your first workout above!</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0' }}>{formatActivityType(activity.type)}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>{formatDate(activity.date)}</p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <span><strong>Duration:</strong> {formatDuration(activity.duration)}</span>
                      <span><strong>Distance:</strong> {formatDistance(activity.distance)}</span>
                      <span><strong>Calories:</strong> {formatCalories(activity.calories)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
