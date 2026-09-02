/*
 * TEAM EXTENSION: turns a Recharts-rendered SVG chart into a PNG data URL so
 * it can be embedded as an image in an exported PDF (jsPDF has no native
 * SVG support). This never modifies the on-screen chart — it clones the SVG
 * node, serializes the clone, draws it onto an off-screen canvas, and reads
 * the canvas back out as a PNG.
 */

function getSvgSize(svg) {
  const rect = svg.getBoundingClientRect();
  const width = rect.width || Number(svg.getAttribute('width')) || 800;
  const height = rect.height || Number(svg.getAttribute('height')) || 360;

  return { height, width };
}

// A chart container can contain more than one <svg> (e.g. small icons); the
// largest one by rendered area is assumed to be the actual chart.
export function findChartSvgForCapture(container) {
  const svgs = [...(container?.querySelectorAll('svg') ?? [])];

  if (svgs.length === 0) {
    return null;
  }

  return svgs.reduce((largestSvg, svg) => {
    const largestSize = getSvgSize(largestSvg);
    const size = getSvgSize(svg);

    return size.width * size.height > largestSize.width * largestSize.height
      ? svg
      : largestSvg;
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load chart SVG image.'));
    image.src = url;
  });
}

export async function captureChartSvgAsPngDataUrl(container) {
  const svg = findChartSvgForCapture(container);

  if (!svg) {
    return null;
  }

  const { height, width } = getSvgSize(svg);
  const clone = svg.cloneNode(true);

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const serializedSvg = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serializedSvg], {
    type: 'image/svg+xml;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const scale = window.devicePixelRatio || 1;

    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create chart export canvas.');
    }

    context.scale(scale, scale);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}
