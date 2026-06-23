================================================================================
  STAYTRACK – HOSTEL MANAGEMENT SYSTEM (USB / PEN DRIVE COPY)
================================================================================

WHAT IS IN THIS FOLDER
----------------------
  backend\     Node.js API (Express + SQLite)
  frontend\    React website (Vite)
  database\    SQL reference (optional; app creates SQLite automatically)

REQUIREMENTS ON THE NEW PC
--------------------------
  • Node.js 18 or newer  →  https://nodejs.org/
  • A web browser (Chrome, Edge, Firefox)

FIRST-TIME SETUP (after copying from USB)
-----------------------------------------
  1) Open Command Prompt or PowerShell in the "backend" folder:
       cd path\to\HostelManagement-StayTrack-USB-PACKAGE\backend
       npm install
       npm start

  2) Open a second window in the "frontend" folder:
       cd path\to\HostelManagement-StayTrack-USB-PACKAGE\frontend
       npm install
       npm run dev

  3) In the browser open:  http://localhost:5173

DEFAULT LOGIN
-------------
  Admin:   username  admin     password  admin123
  Demo student:  register 23CS001   password  student123

  New students added by admin (roll no. + name) use password:  student123

OPTIONAL: SMS (OTP)
-------------------
  Copy backend\.env.example to backend\.env and add Twilio keys if you want
  real SMS. Otherwise OTP shows on screen in development mode.

DATA FILE
---------
  The database file is created at:
    backend\data\staytrack.db
  Copy that file if you want to move existing data to another PC.

================================================================================
  Questions: keep this README with the project when you copy to USB.
================================================================================
