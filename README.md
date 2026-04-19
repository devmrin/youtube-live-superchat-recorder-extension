# YouTube Superchat Recorder Extension

A simple Chrome extension that observes a live YouTube chat window, identifies and records superchat messages, and persists this data to local storage. It captures the author's name, the purchase amount (including currency), and the message content.

## Features
- Automatically records superchat messages from YouTube live streams.
- Saves data (author, amount, message) to local storage.
- Popup to view the recorded data.

## Installation
1. Go to `chrome://extensions/` in your Chrome browser.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the directory containing this extension.

## Usage
1. Make sure the extension is enabled.
2. Go to any YouTube live stream that has superchats in the live chat.
3. The extension will run in the background and record new superchats.
4. Click on the extension icon in the toolbar to view the collected superchats.
