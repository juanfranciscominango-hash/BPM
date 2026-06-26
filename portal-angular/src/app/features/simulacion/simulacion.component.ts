import { Component, OnInit, inject, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiManagerService } from '../../core/services/api-manager.service';
import { ProcessService } from '../../core/services/process.service';
import { TaskService } from '../../core/services/task.service';

import { ParametricService } from '../../core/services/parametric.service';
import { FormulasUtil } from '../../core/utils/formulas.util';
import { debounceTime } from 'rxjs/operators';

interface TipoCredito {
  id: number;
  codigo: string;
  nombre?: string;
  descripcion: string;
}

declare var google: any;

@Component({
  selector: 'innova-simulacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './simulacion.html',
  styleUrl: './simulacion.scss'
})
export class SimulacionComponent implements OnInit, AfterViewInit {
  @ViewChild('direccionInput') direccionInput!: ElementRef;
  
  private _initialData: any = null;
  
  @Input() 
  set initialData(val: any) {
    this._initialData = val;
    if (val && this.simulacionForm) {
      this.cargarDatosIniciales();
    }
  }
  
  get initialData() {
    return this._initialData;
  }
  
  @Output() simulacionDataChange = new EventEmitter<any>();
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private apiManagerService = inject(ApiManagerService);
  private processService = inject(ProcessService);
  private taskService = inject(TaskService);
  private parametricService = inject(ParametricService);
  private ngZone = inject(NgZone);

  buscandoCliente = false;

  ngAfterViewInit() {
    this.initGooglePlaces();
  }

  initGooglePlaces() {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(this.direccionInput.nativeElement, {
        types: ['address']
      });

      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = autocomplete.getPlace();
          if (place && place.formatted_address) {
            this.simulacionForm.patchValue({ direccion: place.formatted_address });
          } else if (place && place.name) {
            this.simulacionForm.patchValue({ direccion: place.name });
          }
        });
      });
    }
  }

  buscarCliente() {
    const ident = this.simulacionForm.get('identificacion')?.value;
    if (!ident) {
      alert("Por favor ingresa una identificación primero.");
      return;
    }
    
    this.buscandoCliente = true;
    this.apiManagerService.testApi('APICLI', { interviniente_int_identificacion: ident, DocumentNumber: ident }).subscribe({
      next: (res) => {
        this.buscandoCliente = false;
        let estadoCivilDb = res?.interviniente_int_estado_civil || res?.estado_civil_solicitante;
        let estadoCivilMapped = '';
        if (estadoCivilDb) {
            estadoCivilDb = String(estadoCivilDb).trim().toUpperCase();
            if (estadoCivilDb === 'SOLTERO') estadoCivilMapped = 'Soltero/a';
            else if (estadoCivilDb === 'CASADO') estadoCivilMapped = 'Casado/a';
            else if (estadoCivilDb === 'DIVORCIADO') estadoCivilMapped = 'Divorciado/a';
            else if (estadoCivilDb === 'VIUDO') estadoCivilMapped = 'Viudo/a';
            else if (estadoCivilDb.includes('HECHO')) estadoCivilMapped = 'Unión de Hecho';
        }

        console.log("=== APICLI RESPONSE ===", res);
        console.log("=== ROOT ESTADO CIVIL DB ===", estadoCivilDb, "MAPPED ===", estadoCivilMapped);

        if (res && res.interviniente_int_nombres_completos) {
          const updates: any = { nombres: res.interviniente_int_nombres_completos.trim() };
          if (estadoCivilMapped) updates.estadoCivil = estadoCivilMapped;
          if (res.direccion_domicilio) updates.direccion = res.direccion_domicilio.trim();
          console.log("=== PATCHING ROOT ===", updates);
          this.simulacionForm.patchValue(updates);
          if (estadoCivilMapped) {
             this.simulacionForm.get('estadoCivil')?.setValue(estadoCivilMapped);
             this.simulacionForm.get('estadoCivil')?.updateValueAndValidity();
          }
        } else if (res && res.nombres_completos) {
          const updates: any = { nombres: res.nombres_completos.trim() };
          if (estadoCivilMapped) updates.estadoCivil = estadoCivilMapped;
          if (res.direccion_domicilio) updates.direccion = res.direccion_domicilio.trim();
          console.log("=== PATCHING ROOT 2 ===", updates);
          this.simulacionForm.patchValue(updates);
          if (estadoCivilMapped) {
             this.simulacionForm.get('estadoCivil')?.setValue(estadoCivilMapped);
             this.simulacionForm.get('estadoCivil')?.updateValueAndValidity();
          }
        } else if (res && (res.primer_nombre || res.primer_apellido)) {
          const fullName = `${res.primer_nombre || ''} ${res.segundo_nombre || ''} ${res.primer_apellido || ''} ${res.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
          const updates: any = { nombres: fullName };
          if (estadoCivilMapped) updates.estadoCivil = estadoCivilMapped;
          console.log("=== PATCHING ROOT 3 ===", updates);
          this.simulacionForm.patchValue(updates);
          if (estadoCivilMapped) {
             this.simulacionForm.get('estadoCivil')?.setValue(estadoCivilMapped);
             this.simulacionForm.get('estadoCivil')?.updateValueAndValidity();
          }
        } else {
          // Si el API retorna un arreglo o datos anidados (como se vio en testApi genérico)
          let dataObj = res;
          if (Array.isArray(res) && res.length > 0) dataObj = res[0];
          else if (res && res.data && Array.isArray(res.data) && res.data.length > 0) dataObj = res.data[0];
          else if (res && res.value && Array.isArray(res.value) && res.value.length > 0) dataObj = res.value[0];
          else if (res && res.data && !Array.isArray(res.data)) dataObj = res.data; // Fallback for single object inside data
          
          if (dataObj && (dataObj.primer_nombre || dataObj.primer_apellido || dataObj.nombres_completos || dataObj.interviniente_int_nombres_completos)) {
            const fullName = dataObj.interviniente_int_nombres_completos || dataObj.nombres_completos || `${dataObj.primer_nombre || ''} ${dataObj.segundo_nombre || ''} ${dataObj.primer_apellido || ''} ${dataObj.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
            
            let nestedEstadoCivilDb = dataObj.interviniente_int_estado_civil || dataObj.estado_civil_solicitante || dataObj.estado_civil;
            let nestedEstadoCivilMapped = '';
            if (nestedEstadoCivilDb) {
                nestedEstadoCivilDb = String(nestedEstadoCivilDb).trim().toUpperCase();
                if (nestedEstadoCivilDb === 'SOLTERO') nestedEstadoCivilMapped = 'Soltero/a';
                else if (nestedEstadoCivilDb === 'CASADO') nestedEstadoCivilMapped = 'Casado/a';
                else if (nestedEstadoCivilDb === 'DIVORCIADO') nestedEstadoCivilMapped = 'Divorciado/a';
                else if (nestedEstadoCivilDb === 'VIUDO') nestedEstadoCivilMapped = 'Viudo/a';
                else if (nestedEstadoCivilDb.includes('HECHO')) nestedEstadoCivilMapped = 'Unión de Hecho';
            }

            console.log("=== NESTED ESTADO CIVIL DB ===", nestedEstadoCivilDb, "MAPPED ===", nestedEstadoCivilMapped);

            const updates: any = { nombres: fullName.trim() };
            if (nestedEstadoCivilMapped) updates.estadoCivil = nestedEstadoCivilMapped;
            console.log("=== PATCHING NESTED ===", updates);
            this.simulacionForm.patchValue(updates);
            
            // Forzar el control específico para asegurarnos que Angular lo tome
            if (nestedEstadoCivilMapped) {
              this.simulacionForm.get('estadoCivil')?.setValue(nestedEstadoCivilMapped);
              this.simulacionForm.get('estadoCivil')?.updateValueAndValidity();
            }
          } else {
            alert("No se encontraron datos para esta identificación.");
          }
        }
      },
      error: (err) => {
        this.buscandoCliente = false;
        alert("Error al conectar con APICLI");
        console.error(err);
      }
    });
  }

  tiposCredito: TipoCredito[] = [];
  productosCredito: any[] = [];
  mesesCredito: any[] = [];
  indicadoresFinancieros: any[] = [];
  selectedProducto: any = null;
  simulacionForm: FormGroup;
  loading = false;
  activeTab: 'ingresos' | 'deudas' = 'ingresos';

  get productosFiltrados(): any[] {
    const tipoVal = this.simulacionForm?.get('tipo')?.value;
    if (!tipoVal) return this.productosCredito;
    const tipoSelec = this.tiposCredito.find(t => t.codigo == tipoVal || t.id == tipoVal);
    if (!tipoSelec) return this.productosCredito;
    return this.productosCredito.filter(p => p.pro_cre_tipo_credito == tipoSelec.id);
  }


  resultadosCalculados = {
    cuotaMensual: 0,
    totalIngresos: 0,
    promedioIngresosDeudor: 0,
    promedioIngresosConyuge: 0,
    promedioIngresosCodeudor: 0,
    totalDeudas: 0,
    dti: 0,
    din: 0,
    cin: 0,
    dinValido: false,
    cinValido: false,
    capacidadPago: 0,
    califica: false,
    calculado: false
  };

  constructor() {
    this.simulacionForm = this.fb.group({
      // 01 Información del Solicitante
      identificacion: ['', Validators.required],
      nombres: [{ value: '', disabled: true }],
      direccion: [{ value: '', disabled: true }],
      estadoCivil: ['', Validators.required],
      requiereCodeudor: [false],

      // 02 Parámetros del Crédito
      tipo: ['', Validators.required],
      producto: ['', Validators.required],
      monto: [null, [Validators.min(10000), Validators.max(250000), Validators.required]],
      plazo: [null, [Validators.min(36), Validators.max(240), Validators.required]],
      tasa: [null],

      // 03 Análisis Financiero
      scoreCrediticio: [750, [Validators.required, Validators.min(0), Validators.max(1000)]],
      ingresos: this.fb.array([]),
      deudas: this.fb.array([])
    });

    // Lógica para cambiar Requiere Codeudor según Estado Civil
    this.simulacionForm.get('estadoCivil')?.valueChanges.subscribe(val => {
      if (val === 'Casado/a' || val === 'Unión de Hecho') {
        this.simulacionForm.patchValue({ requiereCodeudor: true });
      } else {
        this.simulacionForm.patchValue({ requiereCodeudor: false });
      }
    });

    // Lógica para limpiar el producto si cambia el tipo
    this.simulacionForm.get('tipo')?.valueChanges.subscribe(() => {
      this.simulacionForm.get('producto')?.setValue('');
    });

    // Lógica para actualizar parámetros de crédito cuando cambia el producto
    this.simulacionForm.get('producto')?.valueChanges.subscribe(codigoProducto => {
      if (!codigoProducto) return;
      const prod = this.productosCredito.find(p => 
          p.codigo === codigoProducto || 
          p.id == codigoProducto || 
          p.descripcion === codigoProducto || 
          p.nombre === codigoProducto
      );
      if (!prod) {
          return;
      }
      
      if (prod) {
        this.selectedProducto = prod;
        // Asignar tasa sin emitir evento para evitar ciclos de cambios
        this.simulacionForm.patchValue({ tasa: prod.pro_cre_tasa || prod.tasa || 10 }, { emitEvent: false });
        
        this.simulacionForm.get('monto')?.setValidators([
          Validators.required,
          Validators.min(prod.pro_cre_monto_minimo || 1000),
          Validators.max(prod.pro_cre_monto_maximo || 9999999)
        ]);
        this.simulacionForm.get('monto')?.updateValueAndValidity({ emitEvent: false });

        this.simulacionForm.get('plazo')?.setValidators([
          Validators.required,
          Validators.min(prod.pro_cre_plazo_minimo || 12),
          Validators.max(prod.pro_cre_plazo_maximo || 360)
        ]);
        this.simulacionForm.get('plazo')?.updateValueAndValidity({ emitEvent: false });
        
        // Ejecutar análisis automáticamente de forma silenciosa al cambiar producto
        this.ejecutarAnalisis(true);
        
        // Forzar actualización de UI para que se reflejen los cambios en Rango y Tasa
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    this.simulacionForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.ejecutarAnalisis(true);
      this.cdr.detectChanges();
    });
    this.cargarTipos();
    if (this.initialData) {
      this.cargarDatosIniciales();
    }
    this.route.queryParams.subscribe(params => {
      if (params['identificacion'] || params['nombres'] || params['monto']) {
        this.simulacionForm.patchValue({
          identificacion: params['identificacion'] || '',
          nombres: params['nombres'] || '',
          monto: params['monto'] || null
        });
      }
    });
  }

  cargarDatosIniciales() {
    if (!this.simulacionForm || !this.initialData) return;
    
    // Clonamos initialData para no afectar la referencia original
    const dataToPatch = { ...this.initialData };
    
    // Mapeo de estado civil inicial por si viene de DB
    let initEstadoCivilDb = dataToPatch.estadoCivil || dataToPatch.interviniente_int_estado_civil || dataToPatch.estado_civil_solicitante;
    
    console.log("=== INIT DATA ROOT ESTADO CIVIL DB ===", initEstadoCivilDb);

    if (initEstadoCivilDb) {
        initEstadoCivilDb = String(initEstadoCivilDb).trim().toUpperCase();
        if (initEstadoCivilDb === 'SOLTERO') dataToPatch.estadoCivil = 'Soltero/a';
        else if (initEstadoCivilDb === 'CASADO') dataToPatch.estadoCivil = 'Casado/a';
        else if (initEstadoCivilDb === 'DIVORCIADO') dataToPatch.estadoCivil = 'Divorciado/a';
        else if (initEstadoCivilDb === 'VIUDO') dataToPatch.estadoCivil = 'Viudo/a';
        else if (initEstadoCivilDb.includes('HECHO')) dataToPatch.estadoCivil = 'Unión de Hecho';
    }

    console.log("=== INIT DATA PATCHING ===", dataToPatch);

    // Si ingresos o deudas vienen como primitivos (ej. desde el motor BPM mapeado), los quitamos del patchValue 
    // para que no rompan los FormArray de Angular.
    if (typeof dataToPatch.ingresos !== 'object') delete dataToPatch.ingresos;
    if (typeof dataToPatch.deudas !== 'object') delete dataToPatch.deudas;

    // Solo procedemos si ya tenemos los tipos cargados
    this.simulacionForm.patchValue(dataToPatch);
    
    // Forzar el estado civil por separado para evitar que sea sobreescrito
    if (dataToPatch.estadoCivil) {
       this.simulacionForm.get('estadoCivil')?.setValue(dataToPatch.estadoCivil);
       this.simulacionForm.get('estadoCivil')?.updateValueAndValidity();
    }
    
    const ingresosSrc = this.initialData.ingresos_array || (Array.isArray(this.initialData.ingresos) ? this.initialData.ingresos : null);
    if (ingresosSrc && Array.isArray(ingresosSrc)) {
      this.ingresosFormArray.clear();
      ingresosSrc.forEach((ing: any) => {
        this.ingresosFormArray.push(this.fb.group({ ...ing }));
      });
    }
    
    const deudasSrc = this.initialData.deudas_array || (Array.isArray(this.initialData.deudas) ? this.initialData.deudas : null);
    if (deudasSrc && Array.isArray(deudasSrc)) {
      this.deudasFormArray.clear();
      deudasSrc.forEach((deu: any) => {
        this.deudasFormArray.push(this.fb.group({ ...deu }));
      });
    }
    
    // Forzar actualización si producto está seteado para que ValueChanges se entere
    if (this.initialData.producto || this.initialData.producto_credito) {
      const prod = this.initialData.producto || this.initialData.producto_credito;
      this.simulacionForm.get('producto')?.setValue(prod);
      this.simulacionForm.get('producto')?.updateValueAndValidity();
    }

    // Auto ejecutar el análisis para que el panel derecho se muestre calculado
    setTimeout(() => {
        this.ejecutarAnalisis(true);
        this.cdr.detectChanges();
    }, 100);
  }

  // --- MÉTODOS DE FORM ARRAY (INGRESOS) ---
  get ingresosFormArray(): FormArray {
    return this.simulacionForm.get('ingresos') as FormArray;
  }

  get propietariosDisponibles(): string[] {
    const opciones = ['Deudor'];
    const estadoCivil = this.simulacionForm.get('estadoCivil')?.value;
    const requiereCodeudor = this.simulacionForm.get('requiereCodeudor')?.value;

    if (estadoCivil === 'Casado/a' || estadoCivil === 'Unión de Hecho') {
      opciones.push('Cónyuge');
    }
    if (requiereCodeudor) {
      opciones.push('Codeudor');
    }
    return opciones;
  }

  agregarIngreso(periodo: string = '', valorDeudor: number = 0, valorConyuge: number = 0, valorCodeudor: number = 0) {
    const ingresoForm = this.fb.group({
      periodo: [periodo, Validators.required],
      valorDeudor: [valorDeudor, [Validators.required, Validators.min(0)]],
      valorConyuge: [valorConyuge, [Validators.min(0)]],
      valorCodeudor: [valorCodeudor, [Validators.min(0)]]
    });
    this.ingresosFormArray.push(ingresoForm);
  }

  eliminarIngreso(index: number) {
    this.ingresosFormArray.removeAt(index);
  }

  // --- MÉTODOS DE FORM ARRAY (DEUDAS) ---
  get deudasFormArray(): FormArray {
    return this.simulacionForm.get('deudas') as FormArray;
  }

  agregarDeuda(propietario: string = 'Deudor', tipoDeuda: string = 'Préstamo de Consumo', institucion: string = '', cuota: number = 0) {
    const deudaForm = this.fb.group({
      propietario: [propietario, Validators.required],
      tipoDeuda: [tipoDeuda, Validators.required],
      institucion: [institucion, Validators.required],
      cuota: [cuota, [Validators.required, Validators.min(0)]]
    });
    this.deudasFormArray.push(deudaForm);
  }

  eliminarDeuda(index: number) {
    this.deudasFormArray.removeAt(index);
  }

  cargarTipos() {
    this.parametricService.getTableData(9).subscribe({
      next: (res: any) => {
        let arr = Array.isArray(res) ? res : (res.value || []);
        this.tiposCredito = arr;
        if (this.initialData?.tipo) {
            setTimeout(() => this.simulacionForm.get('tipo')?.setValue(this.initialData.tipo));
        }
      }
    });

    this.parametricService.getTableData(16).subscribe({
      next: (res: any) => {
        let arr = Array.isArray(res) ? res : (res.value || []);
        this.productosCredito = arr;
        if (this.initialData?.producto) {
            setTimeout(() => this.simulacionForm.get('producto')?.setValue(this.initialData.producto));
        } else {
            this.simulacionForm.get('producto')?.updateValueAndValidity();
        }
      }
    });

    this.parametricService.getTableData(22).subscribe({
      next: (res: any) => {
        let arr = Array.isArray(res) ? res : (res.value || []);
        this.mesesCredito = arr;
      }
    });

    this.parametricService.getTableData(47).subscribe({
      next: (res: any) => {
        let arr = Array.isArray(res) ? res : (res.value || []);
        this.indicadoresFinancieros = arr;
      }
    });
  }

  ejecutarAnalisis(silent: boolean = false) {
    const vals = this.simulacionForm.value;
    const requiereCodeudor = vals.requiereCodeudor;
    const estadoCivil = vals.estadoCivil;
    const incluyeConyuge = estadoCivil === 'Casado/a' || estadoCivil === 'Unión de Hecho';

    // Validación de ingresos: al menos 2 registros y mayores a 0
    const ingresosArray = this.ingresosFormArray;
    let ingresosValidos = true;
    for (let i = 0; i < ingresosArray.length; i++) {
      const val = ingresosArray.at(i).value;
      const sum = (Number(val.valorDeudor) || 0) + 
                  (incluyeConyuge ? (Number(val.valorConyuge) || 0) : 0) + 
                  (requiereCodeudor ? (Number(val.valorCodeudor) || 0) : 0);
      if (sum <= 0) {
        ingresosValidos = false;
        break;
      }
    }

    if (ingresosArray.length < 2 || !ingresosValidos) {
      if (!silent) {
        alert("Debe ingresar por lo menos dos registros de ingresos y los valores deben ser mayor que 0.");
      }
      this.resultadosCalculados.califica = false;
      this.resultadosCalculados.calculado = true;
      return;
    }

    if (this.simulacionForm.invalid) {
      if (!silent) {
        this.simulacionForm.markAllAsTouched();
        const invalidFields: string[] = [];
        const controls = this.simulacionForm.controls;
        for (const name in controls) {
          if (controls[name].invalid) {
            invalidFields.push(name);
          }
        }
        alert("No se pudo calcular. Los siguientes campos son inválidos: " + invalidFields.join(', '));
      }
      return;
    }

    const scoreCrediticio = Number(vals.scoreCrediticio) || 0;
    
    // 1. Cuota Mensual
    const cuotaMensual = FormulasUtil.calcularCuotaMensual(
      Number(vals.monto),
      Number(vals.tasa),
      Number(vals.plazo)
    );

    // 2. Ingresos
    let totalIngresos = 0;
    let sumDeudor = 0;
    let sumConyuge = 0;
    let sumCodeudor = 0;
    const ingresos = vals.ingresos;
    if (ingresos && ingresos.length > 0) {
        let sum = ingresos.reduce((acc: number, curr: any) => {
          const vd = Number(curr.valorDeudor) || 0;
          const vc = incluyeConyuge ? (Number(curr.valorConyuge) || 0) : 0;
          const vco = requiereCodeudor ? (Number(curr.valorCodeudor) || 0) : 0;
          sumDeudor += vd;
          sumConyuge += vc;
          sumCodeudor += vco;
          return acc + vd + vc + vco;
        }, 0);
        totalIngresos = sum / ingresos.length;
        this.resultadosCalculados.promedioIngresosDeudor = sumDeudor / ingresos.length;
        this.resultadosCalculados.promedioIngresosConyuge = sumConyuge / ingresos.length;
        this.resultadosCalculados.promedioIngresosCodeudor = sumCodeudor / ingresos.length;
    } else {
        this.resultadosCalculados.promedioIngresosDeudor = 0;
        this.resultadosCalculados.promedioIngresosConyuge = 0;
        this.resultadosCalculados.promedioIngresosCodeudor = 0;
    }

    // 3. Deudas
    let totalDeudas = 0;
    const deudas = vals.deudas;
    if (deudas && deudas.length > 0) {
        totalDeudas = deudas.reduce((acc: number, curr: any) => {
            const prop = curr.propietario;
            if (prop === 'Cónyuge' && !incluyeConyuge) return acc;
            if (prop === 'Codeudor' && !requiereCodeudor) return acc;
            return acc + (Number(curr.cuota) || 0);
        }, 0);
    }

    // 4. Indicadores y Scoring via Backend
    // Capacidad de pago local: Ingresos * 0.45 - Deudas
    const capacidadPago = Math.max(0, (totalIngresos * 0.45) - totalDeudas);

    const monto = this.simulacionForm.get('monto')?.value || 0;
    const plazo = this.simulacionForm.get('plazo')?.value || 0;
    const tasa = this.simulacionForm.get('tasa')?.value || 0;

    const reqVariables = {
      ingresos: totalIngresos,
      deudas: totalDeudas,
      monto: monto,
      plazo: plazo,
      tasa: tasa
    };

    const apiUrl = environment.apiUrl + '/crm/rules/evaluate-scoring';
    this.http.post<any>(apiUrl, reqVariables).subscribe({
      next: (res) => {
        const montoValido = this.simulacionForm.get('monto')?.valid ?? false;
        const plazoValido = this.simulacionForm.get('plazo')?.valid ?? false;
        
        const calificaPorScore = scoreCrediticio >= 650;
        const calificaPorCapacidad = (res.cuotaMensual || 0) <= capacidadPago;

        const cinValue = totalIngresos > 0 ? ((res.cuotaMensual || 0) / totalIngresos) * 100 : 0;
        const dinValue = totalIngresos > 0 ? ((totalIngresos - totalDeudas - (res.cuotaMensual || 0)) / totalIngresos) * 100 : 0;

        // Obtener parámetros de validación
        const cinParams = this.indicadoresFinancieros.find(i => i.indicador === 'CIN') || { valor_minimo: 0, valor_maximo: 45 };
        const dinParams = this.indicadoresFinancieros.find(i => i.indicador === 'DIN') || { valor_minimo: 44, valor_maximo: 100 };

        const cinValido = cinValue >= cinParams.valor_minimo && cinValue <= cinParams.valor_maximo;
        const dinValido = dinValue >= dinParams.valor_minimo && dinValue <= dinParams.valor_maximo;

        // Se califica si el Backend dice APROBADO o PRE_APROBADO, y se cumplen los indicadores
        const califica = (res.decision === 'APROBADO' || res.decision === 'PRE_APROBADO') && montoValido && plazoValido && calificaPorScore && calificaPorCapacidad && cinValido && dinValido;

        this.resultadosCalculados = {
          cuotaMensual: res.cuotaMensual || 0,
          totalIngresos,
          promedioIngresosDeudor: this.resultadosCalculados.promedioIngresosDeudor,
          promedioIngresosConyuge: this.resultadosCalculados.promedioIngresosConyuge,
          promedioIngresosCodeudor: this.resultadosCalculados.promedioIngresosCodeudor,
          totalDeudas,
          dti: res.dti || 0,
          din: dinValue,
          cin: cinValue,
          dinValido: dinValido,
          cinValido: cinValido,
          capacidadPago,
          califica,
          calculado: true
        };

        if (res.decision === 'RECHAZADO' && !silent) {
          alert("El motor de reglas de riesgo ha RECHAZADO esta solicitud: " + res.justificacion);
        } else if (res.decision === 'PRE_APROBADO' && !silent) {
           console.log("Pre-aprobado: " + res.justificacion);
        }
      },
      error: (err) => {
        console.error("Error evaluando reglas en backend", err);
        // Fallback básico
        const calificaPorScore = scoreCrediticio >= 650;
        const fallbackCuota = cuotaMensual;
        const calificaPorCapacidad = fallbackCuota <= capacidadPago;
        // Para el fallback asumiremos DTI < 45%
        const fallbackDti = totalIngresos > 0 ? ((totalDeudas + fallbackCuota) / totalIngresos) * 100 : 100;
        const cinValueFallback = totalIngresos > 0 ? (fallbackCuota / totalIngresos) * 100 : 0;
        const dinValueFallback = totalIngresos > 0 ? ((totalIngresos - totalDeudas - fallbackCuota) / totalIngresos) * 100 : 0;

        const cinParamsFB = this.indicadoresFinancieros.find(i => i.indicador === 'CIN') || { valor_minimo: 0, valor_maximo: 45 };
        const dinParamsFB = this.indicadoresFinancieros.find(i => i.indicador === 'DIN') || { valor_minimo: 44, valor_maximo: 100 };
        const cinValidoFB = cinValueFallback >= cinParamsFB.valor_minimo && cinValueFallback <= cinParamsFB.valor_maximo;
        const dinValidoFB = dinValueFallback >= dinParamsFB.valor_minimo && dinValueFallback <= dinParamsFB.valor_maximo;

        const calificaFallback = fallbackDti <= 45 && calificaPorScore && calificaPorCapacidad && cinValidoFB && dinValidoFB;

        this.resultadosCalculados = {
          cuotaMensual: fallbackCuota, totalIngresos, 
          promedioIngresosDeudor: this.resultadosCalculados.promedioIngresosDeudor,
          promedioIngresosConyuge: this.resultadosCalculados.promedioIngresosConyuge,
          promedioIngresosCodeudor: this.resultadosCalculados.promedioIngresosCodeudor,
          totalDeudas, dti: fallbackDti, din: dinValueFallback, cin: cinValueFallback, dinValido: dinValidoFB, cinValido: cinValidoFB, capacidadPago, califica: calificaFallback, calculado: true
        };
        this.emitirDataActualizada();
      }
    });
    // Llamar sincrónicamente por si falla la red, ya se emite con lo local
    this.emitirDataActualizada();
  }

  buildProcessVariables() {
    const formData = this.simulacionForm.getRawValue();

    const { ingresos, deudas, ...restFormData } = formData;

    const tipoSeleccionado = this.tiposCredito.find(t => t.codigo == formData.tipo || t.id == formData.tipo);
    const tipoLabel = tipoSeleccionado ? (tipoSeleccionado.descripcion || tipoSeleccionado.nombre || '').toUpperCase() : '';
    let tipoMapped = formData.tipo;
    if (tipoLabel.includes('HIPOTECARIO')) tipoMapped = 'HIPOTECARIO';
    else if (tipoLabel.includes('CONSUMO')) tipoMapped = 'CONSUMO';

    const productoSeleccionado = this.productosCredito.find(p => p.codigo == formData.producto || p.id == formData.producto);
    const productoId = productoSeleccionado ? productoSeleccionado.id : formData.producto;

    const processVariables = {
        ...restFormData,
        ingresos_array: ingresos,
        deudas_array: deudas,
        
        tipoCredito: tipoMapped,
        tipo_credito: tipoMapped,
        tipo_credito_id: tipoSeleccionado ? tipoSeleccionado.id : null,
        producto_credito: productoId,
        monto_solicitado: formData.monto,
        plazo_meses: formData.plazo,
        tasa_interes: formData.tasa,
        cuota_estimada: Number(this.resultadosCalculados.cuotaMensual || 0).toFixed(2),
        ingresos: this.resultadosCalculados.totalIngresos,
        ingreso_bruto: this.resultadosCalculados.totalIngresos,
        interviniente_int_identificacion: formData.identificacion,
        interviniente_int_nombres_completos: formData.nombres,
        interviniente_int_estado_civil: formData.estadoCivil,

        score_crediticio: formData.scoreCrediticio,
        capacidad_pago: this.resultadosCalculados.capacidadPago,
        cin_valido: this.resultadosCalculados.cinValido,
        din_valido: this.resultadosCalculados.dinValido,
        cin: this.resultadosCalculados.cin,
        din: this.resultadosCalculados.din,

        producto_desc: this.selectedProducto ? (this.selectedProducto.descripcion || this.selectedProducto.nombre || '') : '',
        fecha_caso: new Date().toISOString().split('T')[0],
        fecha_solicitud: new Date().toLocaleString(),

        monto_minimo: this.selectedProducto ? this.selectedProducto.pro_cre_monto_minimo : null,
        monto_maximo: this.selectedProducto ? this.selectedProducto.pro_cre_monto_maximo : null,
        plazo_minimo: this.selectedProducto ? this.selectedProducto.pro_cre_plazo_minimo : null,
        plazo_maximo: this.selectedProducto ? this.selectedProducto.pro_cre_plazo_maximo : null,
        plazo_solicitado_1: formData.plazo,
        plazo_solicitado_2: formData.plazo
    };
    return processVariables;
  }

  emitirDataActualizada() {
      this.simulacionDataChange.emit(this.buildProcessVariables());
  }

  iniciarSolicitud() {
    if (!this.resultadosCalculados.califica) return;
    this.loading = true;
    
    const processVariables = this.buildProcessVariables();

    console.log('DEBUG - Variables enviadas a BPM:', processVariables);

    this.processService.startInstance('Flujo_Credito_Completo', processVariables).subscribe({
      next: () => {
        // Al iniciar la instancia correctamente, buscamos la tarea generada para enviarlo allá
        this.taskService.getTasks().subscribe({
          next: (tasks) => {
            if (tasks && tasks.length > 0) {
              // Parse Java Date String (e.g. "Fri Jun 12 11:22:52 ECT 2026")
              const parseJavaDate = (dateStr: string) => {
                if (!dateStr) return 0;
                const parts = dateStr.split(' ');
                if (parts.length >= 6) {
                   // Formato reconstruido: "12 Jun 2026 11:22:52 GMT-0500"
                   const timeStr = `${parts[2]} ${parts[1]} ${parts[5]} ${parts[3]} GMT-0500`;
                   return new Date(timeStr).getTime();
                }
                return new Date(dateStr).getTime() || 0;
              };

              // Asumimos que la tarea más reciente es la primera actividad de la solicitud
              const sortedTasks = tasks.sort((a, b) => parseJavaDate(b.createTime) - parseJavaDate(a.createTime));
              const newTask = sortedTasks[0];
              this.router.navigate(['/portal/wizard', newTask.id]);
            } else {
              // Si por alguna razón no hay tareas en la bandeja, lo enviamos a la bandeja
              this.router.navigate(['/portal/bandeja']);
            }
          },
          error: (err) => {
            console.error('Error al buscar tareas post-inicio:', err);
            this.router.navigate(['/portal/bandeja']);
          }
        });
      },
      error: (err) => {
        console.error('Error al iniciar el proceso:', err);
        alert('Error al conectar con el motor BPM.');
        this.loading = false;
      }
    });
  }
}
