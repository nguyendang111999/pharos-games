# Pharos Games website

Static website for Pharos Games: a main page, a Privacy Policy and Terms of Use. Plain HTML and CSS, no JavaScript, no third-party requests. A tiny Node script fills in your contact details from one config file.

```
site.config.json           YOUR VALUES: contact email and country (edit this)
index.html                 Main page
privacy-policy/index.html  Privacy Policy   ->  /privacy-policy/
terms-of-use/index.html    Terms of Use     ->  /terms-of-use/
assets/                    Styles and logo
scripts/build.mjs          Copies the site to _site/ and fills in the {{placeholders}}
.github/workflows/pages.yml  Builds and deploys to GitHub Pages on every push to main
```

## Before you publish

1. Edit **`site.config.json`**:

   ```json
   {
     "contactEmail": "support@yourdomain.com",
     "countryOrState": "Vietnam"
   }
   ```

   `countryOrState` is where your studio is based, used for the governing-law clause in the Terms (e.g. `Vietnam` or `the State of Delaware, USA`).

2. Review the third-party services table in `privacy-policy/index.html` (section 6): delete the SDKs you do not use and add the ones you do. It must match what your games ship and what you declare in the Play Console Data safety form.

The build fails, and the site is not deployed, if either value is empty or a `{{placeholder}}` is left in a page, so you cannot publish the placeholders by accident.

## Deploy on GitHub Pages

1. Push this repo to GitHub (it must be public on a free GitHub plan).
2. In the repo go to **Settings -> Pages**, and set **Source** to **GitHub Actions**.
3. Every push to `main` now builds and deploys the site (see the **Actions** tab). The first run can also be started manually.
4. The site is live at `https://<your-username>.github.io/pharos-games/`.

URLs to paste into Play Console:

- Privacy policy: `https://<your-username>.github.io/pharos-games/privacy-policy/`
- Terms of use: `https://<your-username>.github.io/pharos-games/terms-of-use/`
- Website: `https://<your-username>.github.io/pharos-games/`

All links are relative, so the site also works unchanged under a custom domain (add it in **Settings -> Pages**).

Anything you add to the repo root (for example `app-ads.txt`) is published, except `README.md`, `site.config.json` and the `scripts/`, `.github/` folders.

## Preview locally

Needs Node 18+ and Python (or any static server):

```
node scripts/build.mjs --preview
python -m http.server 8000 --directory _site
```

Then open http://localhost:8000/. `--preview` builds even if the config is empty (placeholders stay visible). Without it, the build behaves exactly like the deploy.

## Adding a game

See the commented-out template in `index.html` under the "Our games" section.
