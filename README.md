# Perspective — consultation booking

A responsive HTML, CSS and JavaScript funnel starter for Cal CRM.

## Use

Copy this repository for each client. Edit the HTML, CSS and `site-config.js`. No build command or package installation is needed. In Cal CRM, connect the repository with branch `main`, an empty source folder and an empty output directory. Build and open the private preview, then verify your domain before publishing.

The form/calendar is disconnected by default. Configure your own CRM origin and dedicated public form key or calendar path in `site-config.js`. Never put API keys or other secrets in website files. Replace the privacy notice with the client’s actual policy. No analytics or ad pixels are included.

Preview locally with `python3 -m http.server 4175`, then open http://localhost:4175.
