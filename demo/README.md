📞 Real-Time Contact Support Dashboard

A React-based dashboard system for managing user support messages in real-time.
Includes full CRUD operations, global Axios interceptors, a table-based admin UI, loader, and notification toasts.

🚀 Features
📝 Contact Form (User Side)

Submit support requests

Fields included:

Name

Email

Issue Type

Message

Validates required fields

Shows success notifications

🛠️ Admin Dashboard

View all submitted messages

Mark as Resolved

Delete messages

Clean and responsive table UI

🌐 Axios Interceptors

Shows a global loader on every request

Catches all errors globally

Dispatcher-style notifications for success & failure

🔔 Notifications

Toast-based success/error notifications

Auto-dismiss after a few seconds

Triggered by both local actions & global interceptors

🧪 Mock API (No Backend Needed)

Built-in in-memory mock API

Supports:

GET /contacts

POST /contacts

PATCH /contacts/:id

DELETE /contacts/:id

Simulated network delay for real feel

📂 Project Structure
src/
│── main.jsx
│── App.jsx   ← Full application code (form, admin, interceptors, API)
│── index.css

⚙️ Installation & Setup
1. Create a Vite React App
npm create vite@latest realtime-support -- --template react
cd realtime-support
npm install

2. Replace src/App.jsx

Copy all the code from your project file
real-time-contact-support-dashboard.jsx
→ Paste into:

src/App.jsx

3. Run the App
npm run dev


Visit:

http://localhost:5173/

🎯 How It Works
Contact Form

Users fill the form → Sends POST /contacts → Saves to in-memory DB → Shows success toast.

Admin Dashboard

Loads all messages on GET /contacts and allows:

Resolving (PATCH)

Deleting (DELETE)

Refreshing List manually

Loader & Error Handling

Loader is shown on every Axios request automatically.

Errors from any API call are caught globally.

Toast shows error message without adding code in each component.

🧪 Testing the Features
Feature	Test Method
Form submit	Fill form → Click Send
Required field validation	Remove name/email → Submit
Global loader	Try Refresh / Submit → See loader popup
Error handling	Break API URL → Global toast shows
Resolve message	Click Resolve in Admin
Delete message	Click Delete → Confirm
🚧 Future Improvements

Optional enhancements:

Pagination & search in admin table

Role-based login system

Server-side backend (Node/Express or Django)

Real-time updates using WebSockets

📜 License

This project is open-source and free under the MIT License.