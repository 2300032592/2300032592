import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// Simple sample notifications used when server fetch is not available
const SAMPLE_NOTIFICATIONS = [
  { id: '1', type: 'Result', message: 'mid-sem', timestamp: '2026-04-22T17:51:30', read: false, priority: 2 },
  { id: '2', type: 'Placement', message: 'CSX Corporation hiring', timestamp: '2026-04-22T17:51:18', read: false, priority: 3 },
  { id: '3', type: 'Event', message: 'farewell', timestamp: '2026-04-22T17:51:06', read: true, priority: 1 },
  { id: '4', type: 'Result', message: 'project-review', timestamp: '2026-04-22T17:50:42', read: false, priority: 2 },
  { id: '5', type: 'Placement', message: 'Advanced Micro Devices Inc. hiring', timestamp: '2026-04-22T17:49:42', read: false, priority: 3 }
];

function formatDate(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

function NotificationsPanel({ serverToken }) {
  const [items, setItems] = useState(SAMPLE_NOTIFICATIONS);
  const [filterType, setFilterType] = useState('all');
  const [topN, setTopN] = useState(10);
  const [sortByPriority, setSortByPriority] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attempt to fetch from server only if token is provided.
    if (!serverToken) return;
    setLoading(true);
    setError(null);
    fetch('http://4.224.186.213/evaluation-service/notifications?limit=50', {
      headers: { Authorization: `Bearer ${serverToken}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server ${r.status}`);
        return r.json();
      })
      .then(data => {
        // server returns { notifications: [...] }
        const n = data && data.notifications ? data.notifications : data;
        const mapped = (n || []).map((it, idx) => ({
          id: it.ID || it.id || String(idx),
          type: it.Type || it.type || 'Result',
          message: it.Message || it.message || JSON.stringify(it),
          timestamp: it.Timestamp || it.timestamp || new Date().toISOString(),
          read: !!it.read,
          priority: it.priority || 2
        }));
        setItems(mapped);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [serverToken]);

  const types = useMemo(() => {
    const s = new Set(items.map(i => i.type));
    return ['all', ...Array.from(s)];
  }, [items]);

  function toggleRead(id) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, read: !it.read } : it));
  }

  function markAllRead() {
    setItems(prev => prev.map(it => ({ ...it, read: true })));
  }

  const visible = useMemo(() => {
    let arr = items.slice();
    if (filterType !== 'all') arr = arr.filter(a => a.type === filterType);
    if (sortByPriority) arr.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    arr = arr.slice(0, topN);
    return arr;
  }, [items, filterType, topN, sortByPriority]);

  return (
    <section className="notifications">
      <h2>Notifications</h2>
      <div className="controls">
        <label>Type
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Top
          <input type="number" min={1} max={100} value={topN} onChange={e => setTopN(Number(e.target.value) || 1)} />
        </label>
        <label className="checkbox"><input type="checkbox" checked={sortByPriority} onChange={e => setSortByPriority(e.target.checked)} />Sort by priority</label>
        <button onClick={markAllRead}>Mark all read</button>
      </div>

      {loading && <div className="hint">Loading from server…</div>}
      {error && <div className="msg error">Failed to load: {error}</div>}

      <ul className="list">
        {visible.map(it => (
          <li key={it.id} className={`item ${it.read ? 'read' : 'unread'}`}>
            <div className="left">
              <div className="type">{it.type}</div>
              <div className="message">{it.message}</div>
              <div className="meta">{formatDate(it.timestamp)} • priority:{it.priority}</div>
            </div>
            <div className="right">
              <button onClick={() => toggleRead(it.id)}>{it.read ? 'Mark unread' : 'Mark read'}</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="note small">Tip: If server fetch fails due to CORS, use the PowerShell `get-auth.ps1` to obtain token and paste it above.</div>
    </section>
  );
}

function App() {
  const [tab, setTab] = useState('registration');
  const [form, setForm] = useState({ email: '', name: '', mobileNo: '', githubUsername: '', rollNo: '', accessCode: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [tokenInput, setTokenInput] = useState('');

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
      const res = await fetch('http://4.224.186.213/evaluation-service/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
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
    } finally { setLoading(false); }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Campus Notifications — Demo</h1>
        <nav>
          <button className={tab==='registration'? 'active':''} onClick={() => setTab('registration')}>Registration</button>
          <button className={tab==='notifications'? 'active':''} onClick={() => setTab('notifications')}>Notifications</button>
        </nav>
      </header>

      <main className="container">
        {tab === 'registration' && (
          <section className="form-wrapper">
            <h2>Registration</h2>
            <p className="hint">Fill the form and submit. Capture screenshots (mobile & desktop) after registering.</p>

            <form className="reg-form" onSubmit={handleSubmit}>
              <label>Name<input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" /></label>
              <label>Email<input name="email" value={form.email} onChange={handleChange} placeholder="email@college.edu" /></label>
              <label>Mobile No<input name="mobileNo" value={form.mobileNo} onChange={handleChange} placeholder="9999999999" /></label>
              <label>GitHub Username<input name="githubUsername" value={form.githubUsername} onChange={handleChange} placeholder="github" /></label>
              <label>Roll No<input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="23000xxxxx" /></label>
              <label>Access Code<input name="accessCode" value={form.accessCode} onChange={handleChange} placeholder="(if provided)" /></label>

              <div className="actions"><button type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button></div>
            </form>

            {message && (<div className={`msg ${message.type}`}>{message.text}</div>)}

            <div className="auth-box">
              <label>Paste auth token here (optional):
                <input value={tokenInput} onChange={e => setTokenInput(e.target.value)} placeholder="paste access_token value" />
              </label>
              <div className="small hint">If you have a server token, paste it and switch to Notifications tab to load real data.</div>
            </div>

            <small className="note">Only Material UI or Vanilla CSS allowed for styling in submissions.</small>
          </section>
        )}

        {tab === 'notifications' && (
          <NotificationsPanel serverToken={tokenInput} />
        )}
      </main>
    </div>
  );
}

export default App;
