import React, { useState } from 'react';
import './App.css';
import sampleNotifications from './notificationsSample.json';

function App() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    mobileNo: '',
    githubUsername: '',
    rollNo: '',
    accessCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [authToken, setAuthToken] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [filterType, setFilterType] = useState('all');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function fetchNotificationsFromApi() {
    setLoadingNotifs(true);
    setMessage(null);
    try {
      if (!authToken) throw new Error('Please paste your auth token in the field above');
      const res = await fetch('http://4.224.186.213/evaluation-service/notifications?limit=50&page=1', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      // Expect data.notifications to be an array
      setNotifications(Array.isArray(data.notifications) ? data.notifications : (data.notifications || []));
      setMessage({ type: 'success', text: 'Notifications loaded.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load notifications: ' + err.message });
    } finally {
      setLoadingNotifs(false);
    }
  }

  function loadSample() {
    setNotifications(sampleNotifications.notifications || []);
    setMessage({ type: 'info', text: 'Loaded sample notifications (offline).' });
  }

  function toggleRead(idx) {
    setNotifications(prev => prev.map((n, i) => i === idx ? { ...n, read: !n.read } : n));
  }

  const visibleNotifications = notifications
    .filter(n => filterType === 'all' ? true : (n.Type || n.type || '').toLowerCase() === filterType)
    .sort((a, b) => new Date(b.Timestamp || b.timestamp || 0) - new Date(a.Timestamp || a.timestamp || 0));

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

  
    if (!form.email || !form.name || !form.rollNo) {
      setMessage({ type: 'error', text: 'Please fill name, email and roll number.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://4.224.186.213/evaluation-service/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Status ${res.status}`);
      }

      const data = await res.json().catch(() => null);
      setMessage({ type: 'success', text: 'Registration submitted successfully.' });
      console.log('Registration response:', data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Submission failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App">
      <main className="form-wrapper">
        <h1>Registration</h1>
        <p className="hint">Fill the form and submit. Capture screenshots (mobile & desktop) after registering.</p>

        <form className="reg-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
          </label>

          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} placeholder="email@college.edu" />
          </label>

          <label>
            Mobile No
            <input name="mobileNo" value={form.mobileNo} onChange={handleChange} placeholder="9999999999" />
          </label>

          <label>
            GitHub Username
            <input name="githubUsername" value={form.githubUsername} onChange={handleChange} placeholder="github" />
          </label>

          <label>
            Roll No
            <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="23000xxxxx" />
          </label>

          <label>
            Access Code
            <input name="accessCode" value={form.accessCode} onChange={handleChange} placeholder="(if provided)" />
          </label>

          <div className="actions">
            <button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button>
          </div>
        </form>

        {message && (
          <div className={`msg ${message.type}`}>{message.text}</div>
        )}

        <section className="notifs">
          <h2>Notifications (live)</h2>
          <label>
            Auth Token (paste access_token here)
            <input value={authToken} onChange={e => setAuthToken(e.target.value)} placeholder="Paste token here" />
          </label>
          <div className="actions">
            <button type="button" onClick={fetchNotificationsFromApi} disabled={loadingNotifs}>{loadingNotifs ? 'Loading…' : 'Fetch from API'}</button>
            <button type="button" onClick={loadSample}>Load Sample (offline)</button>
          </div>

          <div className="filters">
            <label>Filter:
              <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="placement">Placement</option>
                <option value="result">Result</option>
                <option value="event">Event</option>
              </select>
            </label>
          </div>

          <ul className="notif-list">
            {visibleNotifications.map((n, i) => (
              <li key={n.ID || n.id || i} className={n.read ? 'read' : 'unread'}>
                <div className="meta">{(n.Type || n.type)} • {new Date(n.Timestamp || n.timestamp).toLocaleString()}</div>
                <div className="msgbody">{n.Message || n.message}</div>
                <div className="nf-actions">
                  <button onClick={() => toggleRead(i)}>{n.read ? 'Mark unread' : 'Mark read'}</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <small className="note">Only Material UI or Vanilla CSS allowed for styling in submissions.</small>
      </main>
    </div>
  );
}

export default App;
