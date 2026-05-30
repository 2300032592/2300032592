import React, { useMemo, useState } from 'react';
import './App.css';

const API_BASE = 'http://4.224.186.213/evaluation-service';
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

async function sendLog(token, level, pkg, messageText) {
  if (!token) return;
  try {
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        stack: 'frontend',
        level,
        package: pkg,
        message: messageText
      })
    });
  } catch {
    // Ignore logging errors to avoid breaking the main UI flow.
  }
}

function normalizeNotifications(data) {
  const list = data && data.notifications ? data.notifications : data;
  return (list || []).map((item, idx) => ({
    id: item.ID || item.id || String(idx),
    type: item.Type || item.type || 'Event',
    message: item.Message || item.message || '',
    timestamp: item.Timestamp || item.timestamp || new Date().toISOString()
  }));
}

function App() {
  const [token, setToken] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [readMap, setReadMap] = useState({});
  const [view, setView] = useState('all');
  const [notificationType, setNotificationType] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function loadNotifications() {
    if (!token.trim()) {
      setError('Please paste access token.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Loading notifications from API...');

    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('page', String(page));
    if (notificationType) {
      params.set('notification_type', notificationType);
    }

    try {
      const res = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Notifications API failed with status ${res.status}`);
      }

      const data = await res.json();
      const normalized = normalizeNotifications(data);
      setNotifications(normalized);
      setStatus(`Loaded ${normalized.length} notifications.`);
      await sendLog(token, 'info', 'api', `loaded notifications count=${normalized.length} page=${page} limit=${limit}`);
    } catch (err) {
      setError(err.message);
      setStatus('');
      await sendLog(token, 'error', 'api', `load notifications failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function isRead(id) {
    return !!readMap[id];
  }

  async function markAsRead(id) {
    setReadMap(prev => ({ ...prev, [id]: true }));
    await sendLog(token, 'info', 'state', `notification marked read id=${id}`);
  }

  const allNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  const priorityNotifications = useMemo(() => {
    return notifications
      .filter(n => !isRead(n.id))
      .slice()
      .sort((a, b) => {
        const weightDiff = (TYPE_WEIGHT[b.type] || 0) - (TYPE_WEIGHT[a.type] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, topN);
  }, [notifications, readMap, topN]);

  const renderList = view === 'all' ? allNotifications : priorityNotifications;

  return (
    <div className="App">
      <header className="app-header">
        <h1>Campus Notifications</h1>
      </header>

      <main className="container">
        <section className="form-wrapper">
          <h2>Stage 7 Frontend</h2>
          <p className="hint">
            Pre-authorized route: paste token and load notifications from the provided API.
          </p>

          <div className="token-box">
            <label>
              Access Token
              <input
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Paste Bearer access token"
              />
            </label>
          </div>

          <div className="controls controls-4">
            <label>
              Notification Type
              <select value={notificationType} onChange={e => setNotificationType(e.target.value)}>
                <option value="">All</option>
                <option value="Event">Event</option>
                <option value="Result">Result</option>
                <option value="Placement">Placement</option>
              </select>
            </label>

            <label>
              Limit
              <input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={e => setLimit(Number(e.target.value) || 1)}
              />
            </label>

            <label>
              Page
              <input
                type="number"
                min={1}
                value={page}
                onChange={e => setPage(Number(e.target.value) || 1)}
              />
            </label>

            <div>
              <button onClick={loadNotifications} disabled={loading}>
                {loading ? 'Loading...' : 'Load Notifications'}
              </button>
            </div>
          </div>

          <div className="view-switch">
            <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
              All Notifications
            </button>
            <button className={view === 'priority' ? 'active' : ''} onClick={() => setView('priority')}>
              Priority Inbox
            </button>

            {view === 'priority' && (
              <label>
                Top N
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={topN}
                  onChange={e => setTopN(Number(e.target.value) || 1)}
                />
              </label>
            )}
          </div>

          {status && <div className="msg success">{status}</div>}
          {error && <div className="msg error">{error}</div>}
        </section>

        <section className="notifications">
          <h2>{view === 'all' ? 'All Notifications' : 'Priority Notifications'}</h2>
          <ul className="list">
            {renderList.map(item => {
              const read = isRead(item.id);
              return (
                <li key={item.id} className={`item ${read ? 'read' : 'unread'}`}>
                  <div className="left">
                    <div className="type-row">
                      <span className="type">{item.type}</span>
                      <span className={`badge ${read ? 'viewed' : 'new'}`}>{read ? 'Viewed' : 'New'}</span>
                    </div>
                    <div className="message">{item.message}</div>
                    <div className="meta">{formatDate(item.timestamp)}</div>
                  </div>
                  <div className="right">
                    {!read && (
                      <button onClick={() => markAsRead(item.id)}>Mark Read</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {!loading && renderList.length === 0 && (
            <div className="hint">No notifications to display for this view.</div>
          )}

          <small className="note">
            Logging integration: all load/read actions are sent to the logging middleware API.
          </small>
        </section>
      </main>
    </div>
  );
}

export default App;
