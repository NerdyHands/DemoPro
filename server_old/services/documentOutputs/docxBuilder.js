const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType
} = require('docx');

function asText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return String(value);
  } catch {
    return '';
  }
}

function paragraph(text, opts = {}) {
  const t = asText(text);
  const runOpts = {
    text: t,
    bold: Boolean(opts.bold),
    italics: Boolean(opts.italic)
  };
  const paraOpts = {
    children: [new TextRun(runOpts)]
  };
  if (opts.heading) paraOpts.heading = opts.heading;
  if (opts.center) paraOpts.alignment = AlignmentType.CENTER;
  if (opts.bullet) paraOpts.bullet = { level: 0 };
  return new Paragraph(paraOpts);
}

function table(rows, opts = {}) {
  const columnWidths = Array.isArray(opts.columnWidths) ? opts.columnWidths : null;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, rowIdx) => {
      return new TableRow({
        children: r.map((cell, cellIdx) => {
          const width = columnWidths?.[cellIdx];
          const cellText = asText(cell);
          const lines = cellText.split('\n');
          const cellParagraphs =
            lines.length > 1
              ? lines.map((line, lineIdx) =>
                  paragraph(line, { bold: rowIdx === 0 && lineIdx === 0 })
                )
              : [paragraph(cellText, { bold: rowIdx === 0 })];
          return new TableCell({
            width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
            children: cellParagraphs
          });
        })
      });
    })
  });
}

/**
 * Build a DOCX buffer from a simple, renderer-friendly model.
 *
 * model = {
 *   title: string,
 *   blocks: Array<
 *     | { type: 'p', text: string, bold?: boolean, italic?: boolean }
 *     | { type: 'center', text: string, bold?: boolean }
 *     | { type: 'h1' | 'h2' | 'h3', text: string }
 *     | { type: 'spacer' }
 *     | { type: 'bullets', items: string[] }
 *     | { type: 'table', rows: string[][], columnWidths?: number[] }
 *   >
 * }
 */
async function buildDocxBuffer(model) {
  const title = asText(model?.title || '').trim();
  const blocks = Array.isArray(model?.blocks) ? model.blocks : [];

  const children = [];
  if (title) {
    children.push(paragraph(title, { bold: true, heading: HeadingLevel.TITLE }));
    children.push(paragraph(''));
  }

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;

    if (block.type === 'spacer') {
      children.push(paragraph(''));
      continue;
    }
    if (block.type === 'h1') {
      children.push(paragraph(block.text || '', { bold: true, heading: HeadingLevel.HEADING_1 }));
    } else if (block.type === 'h2') {
      children.push(paragraph(block.text || '', { bold: true, heading: HeadingLevel.HEADING_2 }));
    } else if (block.type === 'h3') {
      children.push(paragraph(block.text || '', { bold: true, heading: HeadingLevel.HEADING_3 }));
    } else if (block.type === 'center') {
      children.push(
        paragraph(block.text || '', { bold: block.bold, center: true })
      );
    } else if (block.type === 'p') {
      children.push(paragraph(block.text || '', { bold: block.bold, italic: block.italic }));
    } else if (block.type === 'bullets') {
      const items = Array.isArray(block.items) ? block.items : [];
      items.forEach((item) => {
        children.push(paragraph(asText(item), { bullet: true }));
      });
    } else if (block.type === 'table') {
      const rows = Array.isArray(block.rows) ? block.rows : [];
      if (rows.length > 0) {
        children.push(table(rows, { columnWidths: block.columnWidths }));
        children.push(paragraph(''));
      }
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  return await Packer.toBuffer(doc);
}

module.exports = {
  buildDocxBuffer
};
