# ATS WordPress Theme Generator

A static theme generator for GitHub Pages. It creates a customized ATS theme ZIP
in the visitor's browser; it does not require a PHP server.

The generator updates the theme name, author, text domain, and ATS/Underscores
function and CSS prefixes to match the submitted slug. The slug must start with
a lowercase letter so generated PHP identifiers remain valid.

## GitHub Pages setup

1. Push this repository to GitHub.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.
5. Open the Pages URL shown on that settings page.

The source theme is published in `assets/ats-theme-source.zip`. Anyone who can
visit the public site can download those source files. ZIP generation happens
in the visitor's browser; theme details are not sent to a PHP server.

## Updating the source theme

When the ATS theme changes, rebuild the source archive and push the updated
file:

```powershell
.\build-source.ps1
```

The script reads `C:\laragon\www\ats\wp-content\themes\ats` by default. A
different source directory can be supplied with `-ThemePath`. Git metadata and
directories whose names start with `backup` are left out of the archive.

The page includes JSZip 3.10.1 locally, so generating a ZIP does not require an
external CDN. The source archive is public because this is a public repository.
