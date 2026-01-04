const LIST_ITEM_TYPES = new Set(['bulleted_list_item', 'numbered_list_item']);

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRichText(richText = []) {
  return richText
    .map((text) => {
      const plain = escapeHtml(text.plain_text || '');
      const { annotations = {}, href } = text;
      let content = plain;

      if (annotations.code) content = `<code>${content}</code>`;
      if (annotations.bold) content = `<strong>${content}</strong>`;
      if (annotations.italic) content = `<em>${content}</em>`;
      if (annotations.underline) content = `<u>${content}</u>`;
      if (annotations.strikethrough) content = `<s>${content}</s>`;
      if (href) content = `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${content}</a>`;

      return content;
    })
    .join('');
}

function renderChildren(block) {
  if (!block?.children || block.children.length === 0) {
    return '';
  }
  return renderBlocks(block.children);
}

function renderListItem(block) {
  const value = renderRichText(block[block.type].rich_text);
  const nested = renderChildren(block);
  return `<li>${value}${nested ? `<div class="list-nested">${nested}</div>` : ''}</li>`;
}

function renderImage(block) {
  const source = block.image?.file?.url || block.image?.external?.url;
  if (!source) return '';
  const caption = renderRichText(block.image.caption || []);
  const alt = caption || 'Blog image';
  return `<figure><img src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" loading="lazy" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

function renderCallout(block) {
  const icon = block.callout?.icon;
  const iconHtml = icon?.emoji ? `<span class="callout-icon">${escapeHtml(icon.emoji)}</span>` : '';
  const body = renderRichText(block.callout.rich_text || []);
  const children = renderChildren(block);
  return `<div class="callout">${iconHtml}<div class="callout-body">${body}${children}</div></div>`;
}

function renderBookmark(block) {
  const url = block.bookmark?.url;
  const caption = renderRichText(block.bookmark?.caption || []);
  if (!url) return '';
  return `<div class="bookmark"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>${caption ? `<div class="bookmark-caption">${caption}</div>` : ''}</div>`;
}

function renderBlock(block) {
  if (!block) return '';

  switch (block.type) {
    case 'paragraph':
      return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;
    case 'heading_1':
      return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;
    case 'heading_2':
      return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;
    case 'heading_3':
      return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return renderListItem(block);
    case 'to_do':
      return `<div class="todo"><input type="checkbox" disabled ${block.to_do.checked ? 'checked' : ''}/> <span>${renderRichText(block.to_do.rich_text)}</span>${renderChildren(block)}</div>`;
    case 'quote':
      return `<blockquote>${renderRichText(block.quote.rich_text)}${renderChildren(block)}</blockquote>`;
    case 'code':
      return `<pre><code class="language-${escapeHtml(block.code.language || 'plain')}">${escapeHtml(block.code.rich_text.map((t) => t.plain_text || '').join(''))}</code></pre>`;
    case 'divider':
      return '<hr />';
    case 'callout':
      return renderCallout(block);
    case 'image':
      return renderImage(block);
    case 'bookmark':
      return renderBookmark(block);
    case 'toggle':
      return `<details><summary>${renderRichText(block.toggle.rich_text)}</summary>${renderChildren(block)}</details>`;
    default:
      return '';
  }
}

function renderBlocks(blocks = []) {
  let html = '';
  let openList = null;

  const closeList = () => {
    if (openList) {
      html += openList === 'bulleted_list_item' ? '</ul>' : '</ol>';
      openList = null;
    }
  };

  for (const block of blocks) {
    if (LIST_ITEM_TYPES.has(block.type)) {
      if (openList !== block.type) {
        closeList();
        html += block.type === 'bulleted_list_item' ? '<ul>' : '<ol>';
        openList = block.type;
      }
      html += renderBlock(block);
      continue;
    }

    closeList();
    html += renderBlock(block);
  }

  closeList();
  return html;
}

function toPlainText(blocks = []) {
  return blocks
    .map((block) => {
      if (!block) return '';
      const rich = block[block.type]?.rich_text;
      if (Array.isArray(rich)) {
        return rich.map((t) => t.plain_text || '').join(' ');
      }
      if (block.type === 'image' && Array.isArray(block.image?.caption)) {
        return block.image.caption.map((t) => t.plain_text || '').join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

module.exports = {
  renderBlocks,
  toPlainText
};
