export class FormulasUtil {
  /**
   * Calcula la cuota mensual de un préstamo usando el sistema de amortización francesa.
   * @param monto El capital total del préstamo
   * @param tasaAnual La tasa de interés nominal anual en porcentaje (ej: 9 para 9%)
   * @param plazoMeses El plazo del préstamo en meses
   * @returns La cuota mensual calculada
   */
  static calcularCuotaMensual(monto: number, tasaAnual: number, plazoMeses: number): number {
    const P = monto || 0;
    const r = (tasaAnual || 0) / 100 / 12;
    const n = plazoMeses || 1;
    
    if (r === 0 || n === 0) {
      return P / (n || 1);
    }
    
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }
}
