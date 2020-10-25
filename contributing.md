# Contributing Guidelines

First off, thank you for considering to contribute to **Google Meet PiP**!

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

**Google Meet PiP** is an opens source project and would love to receive contributions from you! There are many ways to contribute, from improving documentation, submitting bug reports and feature requests, or writing code which can be incorporated into the project itself.

## Issue tracker

You may use this repository's issue tracker for these purposes:

- **Support questions.** Questions about using or troubleshooting the extension in your browser.
- **Bug reports.** When you encounter unexpected behaviour while using the extension.

For both cases, please be sure to include as much information as possible in your report. Details like the following will make it easier to investigate and address the issues that you report:

- The behaviour that was expected, and what actually happened
- The version of the browser being used
- The steps that were performed up to the point where the issue was encountered

## Submitting patches

If there is no open issue for the change that you want to submit, please open one first for discussion before working on a PR. You can work on any issue that doesn't have an open PR linked to it or a maintainer/contributor assigned to it.

Include the following in your patch:

- Use [Prettier](https://prettier.io/) to format your code. This is run automatically as a pre-commit git hook as you commit your changes.
- Include in the PR description the changes made in the PR.

### Development setup

- Fork the repository to your GitHub account by clicking on the [Fork](https://github.com/arnellebalane/google-meet-pip/fork) button.
- [Clone](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo#step-2-create-a-local-clone-of-your-fork) your fork of the repository locally.
- Install dependencies
  ```
  npm ci
  ```
- Build the extension locally. You can use `watch` mode to automatically rebuild as you save your changes.
  ```
  npm run build
  npm run watch
  ```
- Load the unpacked extension into your browser:
  - Go to [`chrome://extensions`](chrome://extensions).
  - Toggle the "Developer mode" on at the top-right corner of the page.
  - Click on the "Load unpacked" button that appears.
  - Browse to the repository through the file browser and open it.
