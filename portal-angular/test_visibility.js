const evalModel = { 'estado_civil': '', 'separacion_bienes': '', 'requiere_codeudor': '', 'tiene_conyuge': '', 'interviniente_int_estado_civil': 'Viudo/a' };
const rule = "['CASADO', 'UNION LIBRE', 'CASADO/A', 'UNIÓN DE HECHO'].includes(String(typeof estado_civil !== 'undefined' ? estado_civil : '').toUpperCase()) && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'TRUE' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SI' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SÍ'";

try {
    const keys = Object.keys(evalModel);
    const values = Object.values(evalModel);
    const fn = new Function(...keys, 'return ' + rule + ';');
    console.log('Result:', !!fn(...values));
} catch (e) {
    console.log('Error:', e.message);
}
