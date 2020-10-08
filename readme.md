![image](assets/small-promo-tile.png)

# Google Meet PiP

Display a selected Google Meet participant's video in a Picture-in-Picture window.

## Use Cases

- Keep your video stream in display while presenting something else in your screen
- Keep a selected participant visible while navigating to other tabs or applications

## Limitations

- In this version, only the participants that are displayed that are visible in the main meeting layout can be selected to be displayed in a Picture-in-Picture window

## Contributing

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

After following the steps above, load the unpacked copy of this extension into your browser.

- Go to [`chrome://extensions`](chrome://extensions)
- Toggle the "Developer mode" on at the top-right corner of the page
- Click on the "Load unpacked" button that appears
- Browse to the repository and select the `manifest.json` file
- You should now have development version of the extension!
- Go to [https://meet.google.com/](https://meet.google.com/) and enjoy building and testing the extension!
