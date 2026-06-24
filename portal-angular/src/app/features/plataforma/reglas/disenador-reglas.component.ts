import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleService, RuleDefinition } from '../../../core/services/rule.service';
import DmnModeler from 'dmn-js/lib/Modeler';

@Component({
  selector: 'app-disenador-reglas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="designer-container bg-light min-vh-100">
      <!-- Toolbar -->
      <div class="toolbar bg-white border-bottom p-3 d-flex justify-content-between align-items-center shadow-sm">
        <div>
          <button class="btn btn-outline-secondary btn-sm me-3" (click)="regresar()">
            <i class="bi bi-arrow-left me-1"></i>Regresar
          </button>
          <span class="h5 mb-0 fw-bold text-primary"><i class="bi bi-diagram-3 me-2"></i>Regla: {{ ruleDef?.name }}</span>
          <span class="badge bg-info-subtle text-info ms-2 border border-info-subtle">{{ ruleDef?.status }}</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary shadow-sm" (click)="guardar()">
            <i class="bi bi-save me-1"></i>Guardar Borrador
          </button>
          <button class="btn btn-success shadow-sm" (click)="desplegar()">
            <i class="bi bi-rocket-takeoff me-1"></i>Desplegar (Publicar)
          </button>
        </div>
      </div>

      <!-- Modeler Canvas -->
      <div class="modeler-wrapper">
        <div #canvas class="canvas-container"></div>
      </div>
    </div>
  `,
  styles: [`
    .designer-container { display: flex; flex-direction: column; }
    .modeler-wrapper { flex: 1; height: calc(100vh - 72px); position: relative; }
    .canvas-container { height: 100%; width: 100%; }
    .toolbar { z-index: 100; position: sticky; top: 0; }
  `]
})
export class DisenadorReglasComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef;
  
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ruleService = inject(RuleService);
  
  ruleDef: RuleDefinition | null = null;
  private modeler: any;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.modeler = new DmnModeler({
      container: this.canvasRef.nativeElement,
      keyboard: { bindTo: window }
    });

    if (id === 'nuevo') {
      this.crearNueva();
    } else {
      this.cargar(id);
    }
  }

  cargar(id: number) {
    this.ruleService.getRuleById(id).subscribe((rule: RuleDefinition) => {
      this.ruleDef = rule;
      this.modeler.importXML(rule.dmnXml || this.getInitialXml()).then(() => {
        console.log('DMN importado con éxito');
        this.openDecisionTable();
      })
    });
  }

  crearNueva() {
    this.ruleDef = {
      key: 'REGLA_' + Math.random().toString(36).substring(7).toUpperCase(),
      name: 'Nueva Regla DMN',
      status: 'DRAFT',
      dmnXml: this.getInitialXml()
    };
    this.modeler.importXML(this.ruleDef.dmnXml).then(() => {
      this.openDecisionTable();
    });
  }

  openDecisionTable() {
    const views = this.modeler.getViews();
    if (views && views.length > 0) {
      const tableView = views.find((v: any) => v.type === 'decisionTable');
      if (tableView) {
        this.modeler.open(tableView);
      }
    }
  }

  getInitialXml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/" xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/" id="definitions" name="definitions" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="matriz_aprobacion" name="Matriz de Aprobación de Crédito">
    <decisionTable id="decisionTable_1" hitPolicy="UNIQUE">
      <input id="input_monto" label="Monto del Crédito">
        <inputExpression id="expr_monto" typeRef="integer">
          <text>monto</text>
        </inputExpression>
      </input>
      <output id="output_rol" label="Rol Aprobador" name="rol_aprobador" typeRef="string" />
      <rule id="rule_1">
        <description>Nivel 1: Asesor</description>
        <inputEntry id="in_1_1"><text>&lt;= 80000</text></inputEntry>
        <outputEntry id="out_1_1"><text>"ASESOR_CREDITO"</text></outputEntry>
      </rule>
      <rule id="rule_2">
        <description>Nivel 2: Jefe de Crédito</description>
        <inputEntry id="in_2_1"><text>[80001..150000]</text></inputEntry>
        <outputEntry id="out_2_1"><text>"JEFE_CREDITO"</text></outputEntry>
      </rule>
      <rule id="rule_3">
        <description>Nivel 3: Subgerente de Crédito</description>
        <inputEntry id="in_3_1"><text>[150001..200000]</text></inputEntry>
        <outputEntry id="out_3_1"><text>"SUBGERENTE_CREDITO"</text></outputEntry>
      </rule>
      <rule id="rule_4">
        <description>Nivel 4: Gerente de Crédito</description>
        <inputEntry id="in_4_1"><text>&gt;= 200001</text></inputEntry>
        <outputEntry id="out_4_1"><text>"GERENTE_CREDITO"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="matriz_aprobacion">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;
  }

  async guardar() {
    const { xml } = await this.modeler.saveXML({ format: true });
    if (this.ruleDef) {
      this.ruleDef.dmnXml = xml;
      this.ruleService.saveRule(this.ruleDef).subscribe((saved: RuleDefinition) => {
        this.ruleDef = saved;
        alert('Borrador guardado con éxito');
      });
    }
  }

  async desplegar() {
    const { xml } = await this.modeler.saveXML({ format: true });
    if (this.ruleDef) {
      this.ruleDef.dmnXml = xml;
      this.ruleService.saveRule(this.ruleDef).subscribe((saved: RuleDefinition) => {
        this.ruleService.deployRule(saved.id!).subscribe(() => {
          alert('¡Regla desplegada y activa en el motor BPM!');
          this.regresar();
        });
      });
    }
  }

  regresar() {
    this.router.navigate(['/plataforma/reglas']);
  }

  ngOnDestroy() {
    if (this.modeler) this.modeler.destroy();
  }
}
