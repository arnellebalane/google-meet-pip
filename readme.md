![image](assets/small-promo-tile.png)

# Google Meet PiP

Display a selected Google Meet participant's video in a Picture-in-Picture window.

## Use Cases

- Keep your video stream in display while presenting something else in your screen
- Keep a selected participant visible while navigating to other tabs or applications

## Limitations

- In this version, only the participants that are displayed that are visible in the main meeting layout can be selected to be displayed in a Picture-in-Picture window

## Installation

This extension can be installed from the Chrome Web Store: [Google Meet PiP](https://chrome.google.com/webstore/detail/google-meet-pip/ibkkdnfblcekolaagnljieekcaccfpjo)

You can also build and load the extension manually using the following steps:

```
# Clone the repository
git clone git@github.com:arnellebalane/google-meet-pip.git
cd google-meet-pip

# Install dependencies
npm ci

# Build the extension
npm run build
npm run watch  # useful for development
```

After loading and building the project, load the unpacked copy of this extension into your browser.

- Go to [`chrome://extensions`](chrome://extensions)
- Toggle the "Developer mode" on at the top-right corner of the page
- Click on the "Load unpacked" button that appears
- Browse to the repository and select the `manifest.json` file
- You should now have development version of the extension!
- Go to [https://meet.google.com/](https://meet.google.com/) and enjoy building and testing the extension!

## Contributing

- Fork this repository into your Github account
- Follow the installation steps above to run a development version of the extension
- When ready, open a pull request from your fork into this repository
