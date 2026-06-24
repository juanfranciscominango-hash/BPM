import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../../core/services/menu.service';

@Component({
  selector: 'innova-disenador-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disenador-menu.component.html',
  styleUrls: ['./disenador-menu.component.scss']
})
export class DisenadorMenuComponent implements OnInit {
  private menuService = inject(MenuService);

  menus: MenuItem[] = [];
  selectedNode: MenuItem | null = null;
  selectedParentNode: MenuItem | null = null;
  loading = false;
  
  notification: {type: 'success'|'error', msg: string} | null = null;

  ngOnInit() {
    this.cargarMenus();
  }

  cargarMenus() {
    this.loading = true;
    this.menuService.getMenu().subscribe({
      next: (data) => {
        this.menus = data;
        this.loading = false;
        if (this.selectedNode && this.selectedNode.id) {
          // Intentar mantener selección
          this.selectedNode = this.findMenuById(this.menus, this.selectedNode.id) || null;
        }
      },
      error: () => {
        this.showNotification('error', 'Error al cargar los menús.');
        this.loading = false;
      }
    });
  }

  findMenuById(list: MenuItem[], id: number): MenuItem | null {
    for (let m of list) {
      if (m.id === id) return m;
      if (m.children) {
        let found = this.findMenuById(m.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  selectNode(node: MenuItem, parent: MenuItem | null, event: Event) {
    event.stopPropagation();
    this.selectedNode = node;
    this.selectedParentNode = parent;
  }

  nuevoMenuPrincipal() {
    this.selectedParentNode = null;
    this.selectedNode = {
      title: 'Nuevo Menú',
      icon: 'bi bi-app',
      route: '',
      permissionCode: '',
      sortOrder: this.menus.length + 1,
      active: true,
      children: []
    };
  }

  nuevoSubmenu() {
    if (!this.selectedNode || !this.selectedNode.id) {
      this.showNotification('error', 'Seleccione un menú guardado para agregarle un submenú.');
      return;
    }
    const parentId = this.selectedNode.id;
    const count = this.selectedNode.children ? this.selectedNode.children.length : 0;
    this.selectedParentNode = this.selectedNode;
    this.selectedNode = {
      title: 'Nuevo Submenú',
      icon: 'bi bi-app',
      route: '',
      permissionCode: '',
      sortOrder: count + 1,
      parentId: parentId,
      active: true
    };
  }

  guardar() {
    if (!this.selectedNode) return;
    
    // Asignar parentId si está dentro de un padre
    if (this.selectedParentNode && this.selectedParentNode.id) {
      this.selectedNode.parentId = this.selectedParentNode.id;
    } else {
      this.selectedNode.parentId = undefined;
    }

    if (this.selectedNode.id) {
      this.menuService.updateMenu(this.selectedNode.id, this.selectedNode).subscribe({
        next: () => {
          this.showNotification('success', 'Menú actualizado correctamente.');
          this.cargarMenus();
        },
        error: () => this.showNotification('error', 'Error al actualizar.')
      });
    } else {
      this.menuService.createMenu(this.selectedNode).subscribe({
        next: (created) => {
          this.showNotification('success', 'Menú creado correctamente.');
          this.selectedNode = created;
          this.cargarMenus();
        },
        error: () => this.showNotification('error', 'Error al crear.')
      });
    }
  }

  eliminar() {
    if (!this.selectedNode || !this.selectedNode.id) return;
    if (confirm(`¿Estás seguro de eliminar el menú '${this.selectedNode.title}' y todos sus submenús?`)) {
      this.menuService.deleteMenu(this.selectedNode.id).subscribe({
        next: () => {
          this.showNotification('success', 'Menú eliminado correctamente.');
          this.selectedNode = null;
          this.selectedParentNode = null;
          this.cargarMenus();
        },
        error: () => this.showNotification('error', 'Error al eliminar el menú.')
      });
    }
  }

  mover(direccion: 'up'|'down') {
    if (!this.selectedNode || !this.selectedNode.id) return;
    
    let list = this.selectedParentNode ? (this.selectedParentNode.children || []) : this.menus;
    let idx = list.findIndex(m => m.id === this.selectedNode!.id);
    
    if (idx === -1) return;
    if (direccion === 'up' && idx > 0) {
      let temp = list[idx].sortOrder;
      list[idx].sortOrder = list[idx-1].sortOrder;
      list[idx-1].sortOrder = temp;
      this.guardarOrden(list[idx]);
      this.guardarOrden(list[idx-1]);
    } else if (direccion === 'down' && idx < list.length - 1) {
      let temp = list[idx].sortOrder;
      list[idx].sortOrder = list[idx+1].sortOrder;
      list[idx+1].sortOrder = temp;
      this.guardarOrden(list[idx]);
      this.guardarOrden(list[idx+1]);
    }
    // Reordenar localmente
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  guardarOrden(item: MenuItem) {
    if (item.id) {
      this.menuService.updateMenu(item.id, item).subscribe();
    }
  }

  showNotification(type: 'success'|'error', msg: string) {
    this.notification = { type, msg };
    setTimeout(() => this.notification = null, 3000);
  }
}
