import React, { useState } from 'react';
import './App.css';
import sampleNotifications from './notificationsSample.json';

import React, { useState, useEffect } from 'react';
import './App.css';
import notificationsData from './notifications.json';

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

function NotificationsPanel() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    // load sample notifications from the JSON we added
    const list = (notificationsData && notificationsData.notifications) || [];
    // add read flag from localStorage
    const stored = JSON.parse(localStorage.getItem('readFlags') || '{}');
    const withRead = list.map(n => ({ ...n, read: !!stored[n.ID] }));
    setItems(withRead);
  }, []);

  function toggleRead(id) {
    setItems(prev => {
      const next = prev.map(i => i.ID === id ? { ...i, read: !i.read } : i);
      const flags = {};
      next.forEach(i => { if (i.read) flags[i.ID] = true; });
      localStorage.setItem('readFlags', JSON.stringify(flags));
      return next;
    });
  }

  function filtered() {
    const list = items.filter(i => filter === 'all' ? true : i.Type === filter);
    // priority: weight desc, then timestamp desc
    return list.sort((a,b) => {
      const w = (TYPE_WEIGHT[b.Type]||0) - (TYPE_WEIGHT[a.Type]||0);
      if (w !== 0) return w;
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    }).slice(0, topN);
  }

  return (
    <section className="notifications">
      <h2>Notifications</h2>
      <div className="controls">
        <label>Filter:
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="Placement">Placement</option>
            <option value="Result">Result</option>
            <option value="Event">Event</option>
          </select>
        </label>
        <label>Top N:
          <input type="number" value={topN} min={1} max={50} onChange={e => setTopN(Number(e.target.value)||10)} />
        </label>
      </div>

      <ul className="notif-list">
        {filtered().map(n => (
          <li key={n.ID} className={n.read ? 'read' : 'unread'}>
            <div className="meta">
              <strong className="type">{n.Type}</strong>
              <time>{new Date(n.Timestamp).toLocaleString()}</time>
            </div>
            <div className="msg">{n.Message}</div>
            <div className="actions">
              <button onClick={() => toggleRead(n.ID)}>{n.read ? 'Mark unread' : 'Mark read'}</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  // keep existing registration form state but keep it concise
  const [form, setForm] = useState({ email: '', name: '', mobileNo: '', githubUsername: '', rollNo: '', accessCode: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!form.email || !form.name || !form.rollNo) {
      setMessage({ type: 'error', text: 'Please fill name, email and roll number.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://4.224.186.213/evaluation-service/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const errText = await res.text(); throw new Error(errText || `Status ${res.status}`); }
      setMessage({ type: 'success', text: 'Registration submitted successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Submission failed: ' + err.message });
    } finally { setLoading(false); }
  }

  return (
    <div className="App">
      <main className="form-wrapper">
        <h1>Registration</h1>
        <p className="hint">Fill the form and submit. Capture screenshots (mobile & desktop) after registering.</p>

        <form className="reg-form" onSubmit={handleSubmit}>
          <label>Name <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" /></label>
          <label>Email <input name="email" value={form.email} onChange={handleChange} placeholder="email@college.edu" /></label>
          <label>Mobile No <input name="mobileNo" value={form.mobileNo} onChange={handleChange} placeholder="9999999999" /></label>
          <label>GitHub Username <input name="githubUsername" value={form.githubUsername} onChange={handleChange} placeholder="github" /></label>
          <label>Roll No <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="23000xxxxx" /></label>
          <label>Access Code <input name="accessCode" value={form.accessCode} onChange={handleChange} placeholder="(if provided)" /></label>
          <div className="actions"><button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button></div>
        </form>

        {message && (<div className={`msg ${message.type}`}>{message.text}</div>)}

        <small className="note">Only Material UI or Vanilla CSS allowed for styling in submissions.</small>

        <NotificationsPanel />
      </main>
    </div>
  );
}

export default App;
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
