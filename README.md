# WordPress Theme Generator

A static theme generator for GitHub Pages. It creates a customized theme ZIP in
the visitor's browser; it does not require a PHP server.

The generator updates the theme name, optional author, text domain, and theme
function and CSS prefixes to match the slug. If no slug is entered, one is
generated from the theme name. An entered slug must start with a lowercase
letter so generated PHP identifiers remain valid.

## GitHub Pages setup

1. Push this repository to GitHub.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Push to `main` or manually run **Deploy to GitHub Pages** from the
   **Actions** tab.
5. Open the Pages URL shown in the deployment or Pages settings.

The source theme is published in `assets/theme-source.zip`. Anyone who can
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
