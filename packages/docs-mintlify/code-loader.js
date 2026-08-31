function whenPrismReady(cb) {
  if (window.Prism) return cb();
  setTimeout(() => whenPrismReady(cb), 50);
}

document.querySelectorAll('[data-code-src]').forEach(async (el) => {
  if (el.dataset.loaded) return;
  el.dataset.loaded = 'true';

  const src = el.getAttribute('data-code-src');
  const lang = el.getAttribute('data-code-lang') || 'text';
  const filename = el.getAttribute('data-code-filename');
  const showLines = el.getAttribute('data-code-lines') === 'true';

  let text;
  try {
    const res = await fetch(src);
    text = await res.text();
  } catch {
    el.textContent = `Failed to load ${src}`;
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'linked-codeblock';

  if (filename) {
    const header = document.createElement('div');
    header.className = 'linked-codeblock-header';
    header.innerHTML = `<span class="linked-codeblock-filename">${filename}</span>`;
    wrapper.appendChild(header);
  }

  const body = document.createElement('div');
  body.className = 'linked-codeblock-body';

  const pre = document.createElement('pre');
  pre.className = showLines ? 'line-numbers' : '';
  const code = document.createElement('code');
  code.className = `language-${lang}`;
  code.textContent = text.trimEnd();
  pre.appendChild(code);
  body.appendChild(pre);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'linked-codeblock-copy';
  copyBtn.setAttribute('aria-label', 'Copy the contents from the code block');
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(text.trimEnd()).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });
  };
  body.appendChild(copyBtn);

  wrapper.appendChild(body);
  el.replaceWith(wrapper);

  // Wait for Prism to be available (load order across custom .js files isn't guaranteed)
  whenPrismReady(() => Prism.highlightElement(code));
});
