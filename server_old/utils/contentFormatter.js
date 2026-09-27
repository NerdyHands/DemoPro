/**
 * Content Formatter for ezPICRA Blog Server
 * Converts various content formats to beautiful HTML
 */

/**
 * Convert content for web display with professional formatting
 */
function convertContentForWeb(content) {
  if (!content) return '';
  
  // If it's HTML from Google Docs, parse it for rich formatting
  if (content.includes('<html') && content.includes('</html>')) {
    return parseGoogleDocsHTML(content);
  }
  
  // If it's plain text, create world-class formatting
  if (!content.includes('<') && !content.includes('>')) {
    return createWorldClassFormatting(content);
  }
  
  // If it's already formatted HTML, clean it up
  return cleanHTML(content);
}

/**
 * Parse Google Docs HTML and convert to beautiful web content
 */
function parseGoogleDocsHTML(htmlContent) {
  if (!htmlContent || !htmlContent.includes('<html')) {
    return htmlContent;
  }

  console.log('🎨 Parsing Google Docs HTML for professional formatting...');

  try {
    // Extract the main content from Google Docs HTML
    const content = extractMainContent(htmlContent);
    
    // Parse and convert to beautiful HTML
    const beautifulHTML = convertToBeautifulHTML(content);
    
    console.log('✅ HTML parsed and converted to professional web content');
    return beautifulHTML;
    
  } catch (error) {
    console.error('❌ HTML parsing failed:', error.message);
    return htmlContent; // Fallback to original
  }
}

/**
 * Extract main content from Google Docs HTML
 */
function extractMainContent(html) {
  // Remove head and style sections
  let content = html
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Extract body content
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }
  
  // Clean up Google Docs specific elements
  content = content
    .replace(/<div[^>]*class="[^"]*doc-content[^"]*"[^>]*>/gi, '')
    .replace(/<div[^>]*class="[^"]*doc-body[^"]*"[^>]*>/gi, '')
    .replace(/<div[^>]*class="[^"]*doc-contents[^"]*"[^>]*>/gi, '');
  
  return content.trim();
}

/**
 * Convert Google Docs HTML to beautiful web content
 */
function convertToBeautifulHTML(content) {
  // Parse paragraphs and headings
  const elements = parseElements(content);
  
  // Convert to beautiful HTML
  let html = '';
  
  for (const element of elements) {
    html += convertElement(element) + '\n';
  }
  
  // Apply professional styling
  html = enhanceWithProfessionalStyling(html);
  
  return html.trim();
}

/**
 * Parse HTML elements from Google Docs content
 */
function parseElements(content) {
  const elements = [];
  
  // Split by paragraph breaks
  const paragraphs = content.split(/<\/p>\s*<p[^>]*>/i);
  
  for (const para of paragraphs) {
    if (!para.trim()) continue;
    
    // Clean up paragraph tags
    let cleanPara = para.replace(/^<p[^>]*>/, '').replace(/<\/p>$/, '');
    
    // Detect element type
    const element = detectElementType(cleanPara);
    elements.push(element);
  }
  
  return elements;
}

/**
 * Detect the type of element (heading, paragraph, list, etc.)
 */
function detectElementType(content) {
  // Check for headings
  if (isHeading(content)) {
    return {
      type: 'heading',
      level: getHeadingLevel(content),
      content: extractTextContent(content),
      styles: extractStyles(content)
    };
  }
  
  // Check for lists
  if (isList(content)) {
    return {
      type: 'list',
      content: extractTextContent(content),
      styles: extractStyles(content)
    };
  }
  
  // Regular paragraph
  return {
    type: 'paragraph',
    content: extractTextContent(content),
    styles: extractStyles(content)
  };
}

/**
 * Check if content is a heading
 */
function isHeading(content) {
  // Look for heading indicators in Google Docs HTML
  const headingIndicators = [
    content.includes('font-size: 20pt'),
    content.includes('font-size: 18pt'),
    content.includes('font-size: 16pt'),
    content.includes('font-weight: bold'),
    content.includes('text-decoration: underline'),
    content.match(/<span[^>]*style="[^"]*font-size:\s*2[0-9]pt[^"]*"/i),
    content.match(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"/i)
  ];
  
  return headingIndicators.filter(Boolean).length >= 2;
}

/**
 * Determine heading level based on styling
 */
function getHeadingLevel(content) {
  if (content.includes('font-size: 20pt') || content.includes('font-size: 18pt')) {
    return 2; // Main heading
  } else if (content.includes('font-size: 16pt') || content.includes('font-size: 14pt')) {
    return 3; // Sub heading
  } else {
    return 4; // Minor heading
  }
}

/**
 * Check if content is a list
 */
function isList(content) {
  return content.includes('<ul') || content.includes('<ol') || content.includes('list-style-type');
}

/**
 * Extract text content from HTML
 */
function extractTextContent(content) {
  // Remove HTML tags but preserve line breaks
  let text = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Extract styling information from HTML
 */
function extractStyles(content) {
  const styles = {
    fontSize: null,
    fontWeight: null,
    fontStyle: null,
    color: null,
    textDecoration: null
  };
  
  // Extract font size
  const fontSizeMatch = content.match(/font-size:\s*([^;]+)/i);
  if (fontSizeMatch) {
    styles.fontSize = fontSizeMatch[1].trim();
  }
  
  // Extract font weight
  const fontWeightMatch = content.match(/font-weight:\s*([^;]+)/i);
  if (fontWeightMatch) {
    styles.fontWeight = fontWeightMatch[1].trim();
  }
  
  // Extract font style
  const fontStyleMatch = content.match(/font-style:\s*([^;]+)/i);
  if (fontStyleMatch) {
    styles.fontStyle = fontStyleMatch[1].trim();
  }
  
  // Extract color
  const colorMatch = content.match(/color:\s*([^;]+)/i);
  if (colorMatch) {
    styles.color = colorMatch[1].trim();
  }
  
  // Extract text decoration
  const textDecorationMatch = content.match(/text-decoration:\s*([^;]+)/i);
  if (textDecorationMatch) {
    styles.textDecoration = textDecorationMatch[1].trim();
  }
  
  return styles;
}

/**
 * Convert element to beautiful HTML
 */
function convertElement(element) {
  switch (element.type) {
    case 'heading':
      return formatHeading(element);
    case 'list':
      return formatList(element);
    case 'paragraph':
      return formatParagraph(element);
    default:
      return formatParagraph(element);
  }
}

/**
 * Format heading with professional typography
 */
function formatHeading(element) {
  const classes = {
    2: 'text-2xl font-bold mb-6 mt-8 text-gray-900 leading-tight',
    3: 'text-xl font-semibold mb-4 mt-6 text-gray-800 leading-snug',
    4: 'text-lg font-semibold mb-3 mt-4 text-gray-700'
  };
  
  const className = classes[element.level] || classes[4];
  return `<h${element.level} class="${className}">${element.content}</h${element.level}>`;
}

/**
 * Format list with beautiful spacing
 */
function formatList(element) {
  // For now, treat as paragraph - could be enhanced to parse actual list items
  return formatParagraph(element);
}

/**
 * Format paragraph with world-class typography
 */
function formatParagraph(element) {
  let content = element.content;
  
  // Apply inline formatting based on styles
  if (element.styles.fontWeight === 'bold') {
    content = `<strong>${content}</strong>`;
  }
  
  if (element.styles.fontStyle === 'italic') {
    content = `<em>${content}</em>`;
  }
  
  // Determine paragraph class based on content and styling
  let className = 'text-base leading-relaxed mb-4 text-gray-700';
  
  // Large font size gets special treatment
  if (element.styles.fontSize && element.styles.fontSize.includes('18pt')) {
    className = 'text-lg leading-relaxed mb-6 text-gray-800 font-light';
  } else if (element.styles.fontSize && element.styles.fontSize.includes('16pt')) {
    className = 'text-lg leading-relaxed mb-4 text-gray-800';
  }
  
  // Convert line breaks
  content = content.replace(/\n/g, '<br class="mb-2">');
  
  return `<p class="${className}">${content}</p>`;
}

/**
 * Create world-class typography and formatting from plain text
 */
function createWorldClassFormatting(content) {
  let formatted = content.trim();
  
  // Remove the title if it's the first line
  const lines = formatted.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    const firstLine = lines[0].trim();
    const avgLineLength = lines.slice(1).reduce((sum, line) => sum + line.length, 0) / (lines.length - 1);
    
    if (firstLine.length < avgLineLength * 0.8 || 
        firstLine.endsWith(':') || 
        firstLine === firstLine.toUpperCase()) {
      lines.shift();
      formatted = lines.join('\n');
    }
  }
  
  // Split into logical sections
  const sections = detectContentSections(formatted);
  
  // Convert each section to beautiful HTML
  let html = '';
  for (const section of sections) {
    html += formatSection(section) + '\n';
  }
  
  // Apply professional styling
  html = enhanceWithProfessionalStyling(html);
  
  return html.trim();
}

/**
 * Detect content sections (headings, paragraphs, lists)
 */
function detectContentSections(content) {
  const sections = [];
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    
    // Detect headings (short lines, questions, all caps, etc.)
    if (isTextHeading(trimmed)) {
      sections.push({
        type: 'heading',
        level: getTextHeadingLevel(trimmed),
        content: trimmed
      });
    }
    // Detect lists
    else if (isTextList(trimmed)) {
      sections.push({
        type: 'list',
        content: trimmed
      });
    }
    // Regular paragraph
    else {
      sections.push({
        type: 'paragraph',
        content: trimmed
      });
    }
  }
  
  return sections;
}

/**
 * Check if text looks like a heading
 */
function isTextHeading(text) {
  const singleLine = text.replace(/\n/g, ' ').trim();
  
  if (singleLine.length > 120) return false;
  
  const strongIndicators = [
    singleLine.endsWith('?'),
    /^[0-9]+\./.test(singleLine),
    singleLine.match(/^(why|what|how|when|where|best|top|tips|guide|signs|practices)/i),
    singleLine.includes(':') && singleLine.length < 80,
    /^[A-Z][A-Z\s]{2,}/.test(singleLine) && singleLine.length < 60,
  ];
  
  const weakIndicators = [
    singleLine.length < 60,
    /^[A-Z][^.!?]*[^.!?\s]$/.test(singleLine),
    !/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/i.test(singleLine),
  ];
  
  const strongCount = strongIndicators.filter(Boolean).length;
  const weakCount = weakIndicators.filter(Boolean).length;
  
  return strongCount >= 1 || weakCount >= 2;
}

/**
 * Determine heading level for plain text
 */
function getTextHeadingLevel(text) {
  if (text.length < 40) return 2;
  if (text.length < 60) return 3;
  return 4;
}

/**
 * Check if text is a list
 */
function isTextList(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return false;
  
  const listMarkerCount = lines.filter(line => 
    /^[\*\-\+•]\s/.test(line.trim()) ||
    /^[0-9]+\.\s/.test(line.trim()) ||
    /^[a-z]\)\s/i.test(line.trim())
  ).length;
  
  return listMarkerCount >= lines.length * 0.6;
}

/**
 * Format a section into beautiful HTML
 */
function formatSection(section) {
  switch (section.type) {
    case 'heading':
      return formatTextHeading(section);
    case 'list':
      return formatTextList(section);
    case 'paragraph':
      return formatTextParagraph(section);
    default:
      return formatTextParagraph(section);
  }
}

/**
 * Format text headings
 */
function formatTextHeading(section) {
  const classes = {
    2: 'text-2xl font-bold mb-6 mt-8 text-gray-900 leading-tight',
    3: 'text-xl font-semibold mb-4 mt-6 text-gray-800 leading-snug',
    4: 'text-lg font-semibold mb-3 mt-4 text-gray-700'
  };
  
  const className = classes[section.level] || classes[4];
  return `<h${section.level} class="${className}">${section.content}</h${section.level}>`;
}

/**
 * Format text lists
 */
function formatTextList(section) {
  const lines = section.content.split('\n').filter(l => l.trim());
  const items = lines.map(line => {
    const cleaned = line.replace(/^[\*\-\+•]\s*/, '').replace(/^[0-9]+\.\s*/, '').trim();
    return `  <li class="mb-2 text-gray-700">${cleaned}</li>`;
  }).join('\n');
  
  return `<ul class="list-disc list-inside mb-6 space-y-2 text-base leading-relaxed">\n${items}\n</ul>`;
}

/**
 * Format text paragraphs
 */
function formatTextParagraph(section) {
  let content = section.content;
  
  // Apply inline formatting
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  content = content.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Convert line breaks within paragraphs
  content = content.replace(/\n/g, '<br class="mb-2">');
  
  // Use different paragraph styles based on content
  const isIntro = section.content.length > 200;
  const className = isIntro 
    ? 'text-lg leading-relaxed mb-6 text-gray-800 font-light' 
    : 'text-base leading-relaxed mb-4 text-gray-700';
  
  return `<p class="${className}">${content}</p>`;
}

/**
 * Clean existing HTML
 */
function cleanHTML(content) {
  // Basic HTML cleaning and enhancement
  let cleaned = content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '');
  
  // Apply professional styling
  return enhanceWithProfessionalStyling(cleaned);
}

/**
 * Apply professional styling enhancements
 */
function enhanceWithProfessionalStyling(html) {
  // Add semantic styling for business content
  html = html.replace(/(ezPICRA)/g, '<span class="font-semibold text-blue-600">$1</span>');
  html = html.replace(/(PICRA)/gi, '<span class="font-semibold text-indigo-600">$1</span>');
  html = html.replace(/(👉.*?)</, '<span class="text-blue-600 font-semibold">$1</span><');
  
  return html;
}

module.exports = {
  convertContentForWeb,
  parseGoogleDocsHTML,
  createWorldClassFormatting,
  cleanHTML
};
