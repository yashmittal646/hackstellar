# Scanner Bridge — Wireless Phone Barcode Scanner

Scan barcodes with your phone camera and see results instantly on your laptop dashboard.

## Architecture

```
Phone (browser) ──── Socket.IO ──── Backend (Express) ──── Socket.IO ──── Laptop (browser)
      ↓                                     ↓                                    ↓
  @zxing/browser                    QR pairing tokens                    React dashboard
  Rear camera                       Real-time relay                      Scan history
```

## Running the project

### Step 1 — Start the backend (port 3001)
```
cd scanner-bridge
node server.js
```

### Step 2 — Start the frontend (port 5174)
Open a second terminal:
```
cd scanner-bridge/client
npx vite --host
```

### Step 3 — Start ngrok tunnel (REQUIRED for phone camera HTTPS)
Open a third terminal:
```
npx ngrok http 3001
```
Copy the HTTPS URL shown (e.g. `https://abcd1234.ngrok-free.app`)

### Step 4 — Open laptop dashboard
Go to: http://localhost:5174

### Step 5 — Connect your phone
1. Paste the ngrok HTTPS URL into the "Public URL" box on the dashboard
2. Click **Connect Phone**
3. A QR code appears on screen
4. Scan the QR code with your phone camera app
5. Your phone browser opens the scanner page
6. Tap **Start Camera** → then **Start Scanning**
7. Point camera at any barcode
8. Results appear on the laptop dashboard instantly!

## Why HTTPS is required
Mobile browsers (Chrome, Safari) block camera access on plain HTTP.  
ngrok provides a free HTTPS tunnel so your phone can access the camera.

## Supported barcode formats
- EAN-13, EAN-8 (grocery products)
- UPC-A, UPC-E (retail products)  
- Code-128, Code-39 (shipping/logistics)
- QR Code
- Data Matrix, PDF-417

## Ports used
| Service | Port |
|---|---|
| Backend (Express + Socket.IO) | 3001 |
| Frontend (Vite dev server) | 5174 |

Both your existing hackstellar servers still run on ports 5000 and 3000.

