const fs = require('fs');
const file = 'src/app/features/portal-usuario/wizard-flujo/wizard-flujo.component.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  simTotalFields(): number {
    let count = 0;
    if (!this.layout || !this.layout.tabs) return 0;
    this.layout.tabs.forEach((tab: any) => {
      tab.sections.forEach((sec: any) => {
        if (sec.fields) count += sec.fields.length;
      });
    });
    return count;
  }

  getSimGridDisplayValue(col: any, value: any): string {
    return this.formatGridValue(col, value);
  }

  confirmGridRow(field: any) {
    this.saveGridRow();
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.cargarTarea(this.taskId);
    } else {
      // Iniciar nuevo proceso
      this.iniciarProceso();
    }
  }

  iniciarProceso() {
    this.simNotification = 'Iniciando proceso...';
    this.processService.startInstance('Flujo_Credito_Completo', {}).subscribe({
      next: () => {
        this.simNotification = 'Instancia creada con éxito. Buscando primera tarea...';
        setTimeout(() => {
          this.taskService.getTasks().subscribe(tasks => {
            const newTask = tasks.filter(t => t.processDefinitionId.includes('Flujo_Credito_Completo')).pop();
            if (newTask) {
              this.router.navigate(['/portal/wizard', newTask.id]);
            } else {
              this.router.navigate(['/portal/bandeja']);
            }
          });
        }, 1000);
      },
      error: () => alert('Error al iniciar el proceso')
    });
  }

  cargarTarea(id: string) {
    this.taskService.getTasks().subscribe(tasks => {
      this.currentTask = tasks.find(t => t.id === id) || null;
      if (this.currentTask) {
        this.cargarPantallaParaTarea(this.currentTask);
      } else {
        alert('Tarea no encontrada o no asignada a ti.');
        this.router.navigate(['/portal/bandeja']);
      }
    });
  }

  cargarPantallaParaTarea(task: UserTask) {
    this.layout = null;
    const processKey = task.processDefinitionId.split(':')[0];
    const taskKey = task.name; // O el task definition key si está disponible
    
    // Consultar directamente la pantalla de la tarea
    this.screenService.getForTask(processKey, taskKey).subscribe({
      next: (data) => {
        if (data && data.layoutJson) {
          this.currentScreenName = data.name;
          this.layout = typeof data.layoutJson === 'string' ? JSON.parse(data.layoutJson) : data.layoutJson;
          this.activarPreview();
        } else {
          this.buscarPantallaFallback(processKey, taskKey);
        }
      },
      error: () => {
        this.buscarPantallaFallback(processKey, taskKey);
      }
    });
  }`;

// Find where to cut
const lines = content.split('\\n');
// Keep lines up to 60 (index 59)
const top = lines.slice(0, 60).join('\\n');

// Find where to resume: "  buscarPantallaFallback(processKey: string, taskKey: string) {"
const bottomIdx = lines.findIndex(l => l.includes("buscarPantallaFallback(processKey: string, taskKey: string)"));
const bottom = lines.slice(bottomIdx).join('\\n');

fs.writeFileSync(file, top + '\\n' + replacement + '\\n\\n' + bottom);
console.log("Fixed!");
