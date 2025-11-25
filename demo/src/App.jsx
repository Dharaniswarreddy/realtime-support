import React, { useState, useEffect, createContext, useContext } from "react";

// --- Tailwind + React single-file demo app
// Default export is App — paste into a new Vite React project (src/App.jsx)
// or CodeSandbox. Tailwind is used for styling (optional). This file
// contains an axios instance with a mock adapter (in-memory) so you can
// run the full frontend demo without a backend.

// --------------------------
// Minimal styles for Toast/Loader (if Tailwind not available)
const fallbackStyles = `
.toast { position: fixed; right: 18px; top: 18px; z-index: 60; }
.toast-item { background: #111827; color: white; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.loader-overlay { position: fixed; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.14); z-index:50 }
.loader { width:48px; height:48px; border-radius:50%; border:5px solid rgba(255, 255, 255, 0.15); border-top-color:#111827; animation:spin 0.9s linear infinite }
@keyframes spin { to { transform: rotate(360deg) }}
`;

// --------------------------
// Mock Axios-like client with adapter that talks to an in-memory DB
// We'll use a tiny 'axios' shim so we can demonstrate interceptors.

function createMockAxios() {
  const handlers = { request: [], response: [], requestError: [], responseError: [] };
  const instance = {
    defaults: {},
    interceptors: {
      request: {
        use: (onFulfilled, onRejected) => { handlers.request.push(onFulfilled); handlers.requestError.push(onRejected); },
      },
      response: {
        use: (onFulfilled, onRejected) => { handlers.response.push(onFulfilled); handlers.responseError.push(onRejected); },
      },
    },
  };

  // In-memory "DB"
  let idCounter = 3;
  const db = [
    { id: 1, name: "Alice Green", email: "alice@example.com", type: "Billing", message: "Invoice issue", createdAt: Date.now() - 100000, resolved: false },
    { id: 2, name: "Bob Lee", email: "bob@example.com", type: "Technical", message: "Can't login", createdAt: Date.now() - 60000, resolved: false },
  ];

  // Helper to run interceptors
  function runInterceptors(list, arg) {
    return list.reduce((p, fn) => p.then(v => (fn ? Promise.resolve(fn(v)) : v)), Promise.resolve(arg));
  }

  // very small request method
  instance.request = (config) => {
    const cfg = { method: (config.method || 'get').toLowerCase(), url: config.url, data: config.data };
    return runInterceptors(handlers.request, cfg)
      .catch(err => runInterceptors(handlers.requestError, err).then(() => { throw err; }))
      .then((newCfg) => {
        // Simulate latency and error conditions
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              // very small router
              const { method, url, data } = newCfg;
              if (url === '/contacts' && method === 'get') {
                resolve({ status: 200, data: db.slice().sort((a,b)=>b.createdAt-a.createdAt) });
                return;
              }
              if (url === '/contacts' && method === 'post') {
                if (!data || !data.name || !data.email) throw { status: 422, message: 'name and email required' };
                const item = { id: ++idCounter, ...data, createdAt: Date.now(), resolved: false };
                db.push(item);
                resolve({ status: 201, data: item });
                return;
              }
              const idMatch = url.match(/^\/contacts\/(\d+)$/);
              if (idMatch) {
                const id = Number(idMatch[1]);
                const idx = db.findIndex(r=>r.id===id);
                if (idx === -1) throw { status: 404, message: 'not found' };
                if (method === 'delete') { db.splice(idx,1); resolve({ status:204, data: null }); return; }
                if (method === 'patch' || method === 'put') {
                  db[idx] = { ...db[idx], ...(data || {}) };
                  resolve({ status:200, data: db[idx] }); return;
                }
                if (method === 'get') { resolve({ status:200, data: db[idx] }); return; }
              }
              throw { status: 404, message: 'unknown endpoint ' + url };
            } catch (err) {
              reject(err);
            }
          }, 450 + Math.random()*400);
        });
      })
      .then(res => runInterceptors(handlers.response, res), err => runInterceptors(handlers.responseError, err).then(()=>{ throw err; }));
  };

  // convenience methods
  ['get','post','put','patch','delete'].forEach(m=>{ instance[m] = (url,data, cfg)=> instance.request({ method:m, url, data, ...(cfg||{})}); });
  return instance;
}

const api = createMockAxios();

// --------------------------
// Global UI state via context: loader + toasts
const UIContext = createContext();
function useUI() { return useContext(UIContext); }

function UIProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  useEffect(()=>{
    // Attach axios interceptors
    api.interceptors.request.use(cfg => {
      setLoadingCount(c=>c+1);
      return cfg;
    }, err => { setLoadingCount(c=>c+1); return Promise.reject(err); });

    api.interceptors.response.use(res => {
      setLoadingCount(c=>Math.max(0,c-1));
      return res;
    }, err => {
      setLoadingCount(c=>Math.max(0,c-1));
      // Global error catch: show toast
      const msg = err && err.message ? err.message : (err && err.status ? `Error ${err.status}` : 'Unknown error');
      addToast({ type: 'error', text: msg });
      return Promise.reject(err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addToast(t) {
    const id = Math.random().toString(36).slice(2,9);
    const item = { id, ...t };
    setToasts(s=>[item, ...s]);
    setTimeout(()=> setToasts(s=>s.filter(x=>x.id!==id)), 4500);
  }

  return (
    <UIContext.Provider value={{ loading: loadingCount>0, addToast }}>
      {children}
      <div className="toast" aria-live="polite">
        {toasts.map(t=> (
          <div key={t.id} className="toast-item">{t.type==='error' ? '⚠️ ' : '✅ '}{t.text}</div>
        ))}
      </div>
      {loadingCount>0 && (
        <div className="loader-overlay">
          <div className="loader" />
        </div>
      )}
    </UIContext.Provider>
  );
}

// --------------------------
// Contact Form (Create)
function ContactForm({ onCreated }) {
  const { addToast } = useUI();
  const [form, setForm] = useState({ name: '', email: '', type: 'General', message: '' });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/contacts', form);
      addToast({ type: 'success', text: 'Message submitted' });
      setForm({ name:'', email:'', type:'General', message:'' });
      if (onCreated) onCreated(res.data);
    } catch (err) {
      // global interceptor already shows toast; local errors can be more specific
      if (err && err.status === 422) addToast({ type:'error', text: 'Please provide name & email' });
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3">Contact Support</h3>
      <label className="block mb-2">Name
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2 border rounded mt-1" />
      </label>
      <label className="block mb-2">Email
        <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded mt-1" />
      </label>
      <label className="block mb-2">Issue Type
        <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="w-full p-2 border rounded mt-1">
          <option>General</option>
          <option>Billing</option>
          <option>Technical</option>
        </select>
      </label>
      <label className="block mb-3">Message
        <textarea value={form.message} onChange={e=>setForm({...form, message:e.target.value})} className="w-full p-2 border rounded mt-1" rows={4} />
      </label>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? 'Sending...' : 'Send'}</button>
      </div>
    </form>
  );
}

// --------------------------
// Admin Dashboard - list contacts, mark resolved, delete
function AdminDashboard() {
  const { addToast } = useUI();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get('/contacts');
      setRows(res.data);
    } catch (err) {
      // handled by interceptor
    } finally { setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); }, []);

  async function markResolved(id) {
    try {
      const res = await api.patch(`/contacts/${id}`, { resolved: true });
      setRows(r=>r.map(x=>x.id===id?res.data:x));
      addToast({ type:'success', text:'Marked resolved' });
    } catch (err) {}
  }

  async function remove(id) {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setRows(r=>r.filter(x=>x.id!==id));
      addToast({ type:'success', text:'Deleted' });
    } catch (err) {}
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Admin Dashboard</h3>
        <div>
          <button onClick={fetchAll} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="text-left border-b"><th className="p-2">Name</th><th>Email</th><th>Type</th><th>Message</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{r.name}</td>
                <td>{r.email}</td>
                <td>{r.type}</td>
                <td>{r.message}</td>
                <td>{r.resolved ? '✅ Resolved' : '🔴 Open'}</td>
                <td className="p-2">
                  {!r.resolved && <button onClick={()=>markResolved(r.id)} className="mr-2 px-2 py-1 border rounded">Resolve</button>}
                  <button onClick={()=>remove(r.id)} className="px-2 py-1 border rounded">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No messages</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --------------------------
// App - shows form + admin split view
export default function App() {
  const [showAdmin, setShowAdmin] = useState(true);

  return (
    <UIProvider>
      <style>{fallbackStyles}</style>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Real-Time Contact Support Dashboard</h1>
            <div>
              <button onClick={()=>setShowAdmin(s=>!s)} className="px-3 py-1 border rounded">{showAdmin ? 'Switch to User' : 'Switch to Admin'}</button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ContactForm onCreated={()=>{ /* Optionally refresh admin via event bus */ }} />
            </div>
            <div className="md:col-span-2">
              {showAdmin ? <AdminDashboard /> : (
                <div className="p-4 bg-white rounded-lg shadow-sm">Thank you for contacting support — we'll get back shortly.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UIProvider>
  );
}
