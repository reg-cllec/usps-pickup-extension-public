USPS Pickup Auto‑Filler Chrome Extension
=====================================

This extension automatically fills the USPS package‑pickup form with your saved
information and submits the request.

Files
-----
- **manifest.json** – declares the extension (manifest v3).
- **content.js** – runs on the USPS pickup page, injects your data, selects the
  state, and clicks the required Continue/Submit buttons.

Installation
------------
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top‑right).
3. Click **Load unpacked**.
4. In the file chooser, select the folder:
   `/home/mikeng/usps-pickup-extension`.
5. The extension will appear in the list. No UI is shown – it works
   automatically when you visit the USPS pickup page.

Usage
-----
1. Navigate to `https://tools.usps.com/schedule-pickup-steps.htm`.
2. The script will populate all fields with the data defined in `content.js`
   (first name, last name, address, etc.) and automatically click the
   **Continue** buttons for each step, finally submitting the request.
3. After submission you will see the confirmation screen with a pickup
   confirmation number. No further interaction is required.

Customization
-------------
If you want to change any of the saved values, edit the `data` object at the
top of `content.js` and reload the extension (click the reload button on the
extension card in `chrome://extensions`).

Security & Privacy
-----------------
The extension only runs on the USPS domain and does not transmit any data to
external servers. All information is stored locally in the script.

If you encounter any issues (e.g., the page layout changes), you may need to
adjust the selectors in `content.js`.
