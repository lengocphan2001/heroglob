/**
 * Chuẩn hóa chuỗi giá để hiển thị: không scientific notation, không số 0 thừa.
 * VD: "0.002", "2e-15", 0.002 → "0.002"; tránh hiển thị 0.000000000000002 hay 2e-15.
 */
export function formatPriceDisplay(value: string | number): string {
  if (value == null || value === '') return '0';
  const s = String(value).trim().replace(/,/g, '');
  if (s === '' || s === '-') return '0';
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s;
  if (n === 0) return '0';
  // Tránh scientific notation: dùng toFixed với tối đa 18 chữ số thập phân, rồi bỏ số 0 thừa
  const abs = Math.abs(n);
  const decimals = abs >= 1 ? 0 : abs >= 0.1 ? 1 : abs >= 0.01 ? 2 : abs >= 0.001 ? 3 : Math.min(18, 18 - Math.floor(Math.log10(abs)) - 1);
  let out = n.toFixed(Math.max(0, decimals));
  if (out.includes('.')) {
    out = out.replace(/\.?0+$/, '');
  }
  return out;
}
