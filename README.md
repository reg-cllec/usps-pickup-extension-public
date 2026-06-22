# USPS Pickup Google Extension

A lightweight Chrome/Edge extension that integrates USPS package pickup scheduling directly into the browser. 

## Features
- Quickly schedule a USPS pickup for packages at your home or office.
- Shows upcoming pickups and recent history.
- Simple UI integrated into the Chrome toolbar.

## Installation
1. Clone this repository or download the source.
2. Open Chrome's **Extensions** page (`chrome://extensions`).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `usps-pickup-extension` folder.

## Usage
- Click the extension icon to open the popup.
- Enter your USPS credentials and click **Schedule Pickup**.
- The extension will communicate with the USPS API (via your backend) and confirm the pickup.

## Development
- `manifest.json` defines the extension manifest.
- `content.js` contains the core logic.
- Run `npm install` (if a build step is added) and `npm run build` to bundle assets.

## License
MIT License – feel free to modify and redistribute.
