📞 Real-Time Contact Support Dashboard












A modern React-based contact support system featuring CRUD operations,
Axios interceptors, notifications, error handling, and an Admin Dashboard.
Runs completely without a backend using a built-in mock API.

✨ Features
📝 Contact Form (User)

Submit support requests

Name, Email, Issue Type, Message

Client + server validation

Success toast notification

🛠️ Admin Dashboard

View all submitted messages

Mark messages as Resolved

Delete messages

Clean table UI

Manual Refresh button

🌐 Axios Interceptors

Shows a global loader on every API request

Catches all errors globally

Auto-triggers error notification toasts

🔔 Notification System

Toast alerts for success & error

Auto-dismiss after a few seconds

Globally accessible with context

🧪 Built-in Mock API

No server required!

Supports:

GET /contacts

POST /contacts

PATCH /contacts/:id

DELETE /contacts/:id

Simulated network delay

📂 Project Structure
src/
│── main.jsx
│── App.jsx   # Full app including contact form, dashboard, API, interceptors
│── index.css

⚙️ Installation
1️⃣ Create a Vite React App
npm create vite@latest realtime-support -- --template react
cd realtime-support
npm install

2️⃣ Replace src/App.jsx

Paste your main app file
real-time-contact-support-dashboard.jsx
into:

src/App.jsx

3️⃣ Run the App
npm run dev


Visit:

http://localhost:5173/

🎯 How It Works
Contact Form

User enters details → POST /contacts

Saves to in-memory DB

Shows success notification

Admin Dashboard

Loads all messages via GET /contacts

Admin can:

Resolve → PATCH /contacts/:id

Delete → DELETE /contacts/:id

Updates UI instantly

Axios Interceptors

Before request → Show loader overlay

After request → Hide loader

On error → Display toast notification

🧪 Testing Checklist
Function	Expected
Submit form	New message in admin list
Validation	Missing name/email shows error
Loader	Visible during all requests
Error handling	Toast + global catch
Resolve action	Status changes to “Resolved”
Delete action	Row removed from table
🚀 Future Enhancements

Pagination & Search in admin table

Real backend API (Node/Express or Django/FastAPI)

JWT login for admin

WebSocket real-time updates

Dark mode

🤝 Contributing

Contributions are welcome!
Feel free to open Issues or Pull Requests.

📜 License

This project is open-source under the MIT License.
