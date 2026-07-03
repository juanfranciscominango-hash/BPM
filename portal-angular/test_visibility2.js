const rule = "['CASADO', 'UNION LIBRE', 'CASADO/A', 'UNIÓN DE HECHO'].includes(String(typeof estado_civil !== 'undefined' ? estado_civil : '').toUpperCase()) && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'TRUE' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SI' && String(typeof separacion_bienes !== 'undefined' ? separacion_bienes : '').toUpperCase() !== 'SÍ'";

fetch('http://localhost:9091/api/v1/tasks/c640aabf-730a-11f1-bb97-00155d998618/variables').then(r=>r.json()).then(d=> {
    const evalModel = { ...d };
    const keysToEnsure = ['estado_civil', 'separacion_bienes', 'requiere_codeudor', 'tiene_conyuge'];
    for (const k of keysToEnsure) {
        if (!(k in evalModel)) evalModel[k] = '';
    }
    const keys = Object.keys(evalModel);
    const values = Object.values(evalModel);
    try {
        const fn = new Function(...keys, 'return ' + rule + ';');
        console.log('EVAL:', !!fn(...values));
    } catch(e) {
        console.log('ERROR:', e.message);
    }
});
