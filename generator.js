(function () {
	'use strict';

	const form = document.getElementById('theme-form');
	const button = document.getElementById('generate-button');
	const status = document.getElementById('status');
	const sourceArchive = 'assets/theme-source.zip';
	const textFileExtensions = /\.(?:css|dist|html?|js|json|md|php|pot|scss|svg|text|txt|xml|ya?ml)$/i;

	function setStatus(message, state) {
		status.textContent = message;
		status.dataset.state = state || 'info';
	}

	function isTextFile(path) {
		return textFileExtensions.test(path) || /(?:^|\/)\.(?:editorconfig|eslintrc|gitignore|stylelintrc\.json)$/.test(path);
	}

	async function generateTheme(themeName, themeSlug, authorName) {
		if (typeof JSZip === 'undefined') {
			throw new Error('ZIP ဖန်တီးရန်လိုအပ်သော library ကို မရရှိနိုင်ပါ။ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။');
		}

		const response = await fetch(sourceArchive, { cache: 'no-store' });
		if (!response.ok) {
			throw new Error('Theme ဖိုင်များကို ဖတ်မရပါ။ ထပ်မံကြိုးစားပါ။');
		}

		const sourceZip = await JSZip.loadAsync(await response.arrayBuffer());
		const outputZip = new JSZip();
		const filePaths = Object.keys(sourceZip.files).filter(function (path) {
			return !sourceZip.files[path].dir;
		});
		const slugWithUnderscores = themeSlug.replace(/-/g, '_');

		for (const path of filePaths) {
			const file = sourceZip.files[path];
			let outputPath = path;
			if (path === 'languages/_s.pot') {
				outputPath = 'languages/' + themeSlug + '.pot';
			}

			if (isTextFile(path)) {
				let contents = await file.async('string');
				contents = contents
					.replace(/^Text Domain:\s*.*$/gm, () => 'Text Domain: ' + themeSlug)
					.replace(/(['"])_s\1/g, (_match, quote) => quote + themeSlug + quote)
					.replace(/_S_/g, () => slugWithUnderscores.toUpperCase() + '_')
					.replace(/_s_/g, () => slugWithUnderscores + '_')
					.replace(/_s-/g, () => themeSlug + '-')
					.replace(/ _s/g, () => ' ' + themeName);

				if (path === 'style.css' || path === 'style-rtl.css') {
					contents = contents.replace(/^Theme Name:\s*.*$/m, () => 'Theme Name: ' + themeName);
					if (authorName) {
						contents = contents.replace(/^Author:\s*.*$/m, () => 'Author: ' + authorName);
					}
				}

				outputZip.file(themeSlug + '/' + outputPath, contents);
			} else {
				outputZip.file(themeSlug + '/' + outputPath, await file.async('uint8array'));
			}
		}

		setStatus('ZIP ဖိုင် ဖန်တီးနေပါသည်…');
		const blob = await outputZip.generateAsync({
			type: 'blob',
			mimeType: 'application/zip',
			compression: 'DEFLATE',
			compressionOptions: { level: 6 }
		});
		const downloadUrl = URL.createObjectURL(blob);
		const downloadLink = document.createElement('a');
		downloadLink.href = downloadUrl;
		downloadLink.download = themeSlug + '.zip';
		document.body.appendChild(downloadLink);
		downloadLink.click();
		downloadLink.remove();
		window.setTimeout(function () {
			URL.revokeObjectURL(downloadUrl);
		}, 1000);
	}

	function createSlug(themeName) {
		let slug = themeName.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60)
			.replace(/-+$/g, '');

		if (!slug) {
			slug = 'my-theme';
		} else if (!/^[a-z]/.test(slug)) {
			slug = ('theme-' + slug).slice(0, 60).replace(/-+$/g, '');
		}

		return slug;
	}

	form.addEventListener('submit', async function (event) {
		event.preventDefault();
		if (!form.reportValidity()) {
			return;
		}

		const themeName = form.elements.theme_name.value.trim();
		const enteredSlug = form.elements.theme_slug.value.trim();
		const authorName = form.elements.author_name.value.trim().replace(/[\r\n]/g, ' ');

		if (!themeName) {
			setStatus('Theme အမည်ကို ဖြည့်ပါ။', 'error');
			return;
		}

		const themeSlug = enteredSlug || createSlug(themeName);
		if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(themeSlug)) {
			setStatus('Theme Slug ကို အင်္ဂလိပ်စာလုံးအသေးဖြင့် စပြီး ဂဏန်းနှင့် hyphen များဖြင့် မှန်ကန်စွာ ဖြည့်ပါ။', 'error');
			return;
		}

		const safeThemeName = themeName.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').trim();
		const safeAuthorName = authorName.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').trim();
		if (!safeThemeName) {
			setStatus('Theme အမည်ကို ဖြည့်ပါ။', 'error');
			return;
		}

		button.disabled = true;
		setStatus('ပြင်ဆင်နေပါသည်…');
		try {
			await generateTheme(safeThemeName, themeSlug, safeAuthorName);
			setStatus('ပြီးပါပြီ။ ZIP ဖိုင်ကို ဒေါင်းလုဒ်လုပ်နေပါသည်။', 'success');
		} catch (error) {
			setStatus(error instanceof Error ? error.message : 'ZIP ဖိုင် ဖန်တီးရာတွင် အမှားဖြစ်နေပါသည်။', 'error');
		} finally {
			button.disabled = false;
		}
	});
}());
