/*
 * TEAM EXTENSION: the shared "save this Blob as a file" mechanism used by
 * both the Excel and PDF export services. A throwaway anchor element with a
 * synthetic click is the standard way to trigger a browser download from
 * client-side JavaScript with no backend involved; the object URL is
 * revoked immediately after the click to avoid leaking memory.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
