![image](assets/small-promo-tile.png)

# Google Meet PiP

A Google Chrome extension that displays a selected Google Meet participant's video in a Picture-in-Picture window.

## Use Cases

- Keep your video stream in display while presenting something else in your screen
- Keep a selected participant visible while navigating to other tabs or applications

## Limitations

- In this version, only the participants that are displayed that are visible in the main meeting layout can be selected to be displayed in a Picture-in-Picture window

## Installation

This extension can be installed from the Chrome Web Store. [Install from Chrome Web Store](https://chrome.google.com/webstore/detail/google-meet-pip/ibkkdnfblcekolaagnljieekcaccfpjo)

We can also build and load the extension manually with the following steps:

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

After loading and building the project, we load the unpacked copy of this extension into our browser:

- Go to [`chrome://extensions`](chrome://extensions)
- Toggle the "Developer mode" on at the top-right corner of the page
- Click on the "Load unpacked" button that appears
- Browse to the repository from the file browser and open it
- We should now have development version of the extension!
- Go to [https://meet.google.com/](https://meet.google.com/) and enjoy building and testing the extension!

## Usage

After installing the extension following the [Installation instructions](#installation), it will then appear in the extensions menu in our Google Chrome browser.

While in a Google Meet meeting, click on the extension's icon to display a list of participants then choose the one to display in a Picture-in-Picture window.

## Contributing

Thank you for considering to contribute to this project! Below is a quick overview of how to start contributing:

- Fork this repository into your Github account
- Follow the installation steps above to run a development version of the extension
- When ready, open a pull request from your fork into this repository

For more information about contributing, please read the [Contributing guidelines](contributing.md).

## License

[MIT License](https://choosealicense.com/licenses/mit/)
