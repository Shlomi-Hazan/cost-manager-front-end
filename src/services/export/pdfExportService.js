import { getModelRowsForPdf } from "./exportModels.js";
import { downloadBlob } from "./downloadService.js";

async function createPdfDocument() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const autoTable = autoTableModule.autoTable ?? autoTableModule.default;

  return {
    autoTable,
    doc: new jsPDF({ compress: false, unit: "pt", format: "a4" })
  };
}

function addTitle(doc, title) {
  doc.setFontSize(18);
  doc.text("Cost Manager", 40, 44);
  doc.setFontSize(14);
  doc.text(title, 40, 68);
}

function addMetadata(doc, lines, startY = 94) {
  doc.setFontSize(10);
  lines.forEach((line, index) => {
    doc.text(line, 40, startY + index * 16);
  });

  return startY + lines.length * 16 + 12;
}

function outputPdfBytes(doc) {
  return doc.output("arraybuffer");
}

function addNoDataMessage(doc, message, y) {
  doc.setFontSize(10);
  doc.text(message, 40, y);

  return y + 20;
}

function getChartMetadataLines(model) {
  if (model.type === "pie-chart") {
    return [
      `Period: ${model.metadata.periodLabel}`,
      `Currency: ${model.metadata.currency}`,
      `Total: ${model.metadata.totalLabel}`,
      `Categories: ${model.metadata.categoryCount}`
    ];
  }

  return [
    `Year: ${model.metadata.year}`,
    `Currency: ${model.metadata.currency}`,
    `Annual total: ${model.metadata.annualTotalLabel}`,
    `Months with costs: ${model.metadata.monthsWithCosts}`
  ];
}

export function fitImageWithinBounds({ width, height, maxWidth, maxHeight }) {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  return {
    height: height * scale,
    width: width * scale
  };
}

function addChartImage(doc, chartImageDataUrl, y) {
  const horizontalMargin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - horizontalMargin * 2;
  const maxHeight = 260;
  const imageProperties = doc.getImageProperties(chartImageDataUrl);
  const size = fitImageWithinBounds({
    width: imageProperties.width,
    height: imageProperties.height,
    maxWidth,
    maxHeight
  });
  const x = horizontalMargin + (maxWidth - size.width) / 2;

  doc.addImage(
    chartImageDataUrl,
    "PNG",
    x,
    y,
    size.width,
    size.height,
    undefined,
    "FAST"
  );

  return y + size.height + 20;
}

export async function createReportPdfBuffer(model) {
  const { autoTable, doc } = await createPdfDocument();

  addTitle(doc, model.title);
  const nextY = addMetadata(doc, [
    model.type === "monthly-report"
      ? `Period: ${model.metadata.periodLabel}`
      : `Year: ${model.metadata.year}`,
    `Report currency: ${model.metadata.currency}`,
    `Total: ${model.metadata.totalLabel}`,
    `Number of costs: ${model.metadata.numberOfCosts}`
  ]);

  if (model.rows.length === 0) {
    addNoDataMessage(doc, "No costs found for this period.", nextY);
  }

  autoTable(doc, {
    head: [model.columns],
    body: getModelRowsForPdf(model),
    startY: model.rows.length === 0 ? nextY + 16 : nextY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  return outputPdfBytes(doc);
}

export async function createChartPdfBuffer(model, chartImageDataUrl = null) {
  const { autoTable, doc } = await createPdfDocument();

  addTitle(doc, model.title);
  let nextY = addMetadata(doc, getChartMetadataLines(model));

  if (chartImageDataUrl) {
    nextY = addChartImage(doc, chartImageDataUrl, nextY);
  } else {
    nextY = addNoDataMessage(doc, "No chart visualization is available for this data.", nextY);
  }

  if (model.rows.length === 0) {
    nextY = addNoDataMessage(doc, "No data rows are available.", nextY);
  }

  autoTable(doc, {
    head: [model.columns],
    body: getModelRowsForPdf(model),
    startY: nextY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] }
  });

  return outputPdfBytes(doc);
}

export async function downloadPdf(createBuffer, filename) {
  const buffer = await createBuffer();
  const blob = new Blob([buffer], { type: "application/pdf" });

  downloadBlob(blob, filename);
}

export function downloadReportPdf(model, filename) {
  return downloadPdf(() => createReportPdfBuffer(model), filename);
}

export function downloadChartPdf(model, filename, chartImageDataUrl) {
  return downloadPdf(
    () => createChartPdfBuffer(model, chartImageDataUrl),
    filename
  );
}
