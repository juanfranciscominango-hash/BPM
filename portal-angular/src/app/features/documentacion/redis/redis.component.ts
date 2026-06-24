import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'innova-redis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './redis.html',
  styleUrl: './redis.scss'
})
export class RedisComponent {
  private http = inject(HttpClient);

  // Estado de conexión
  redisConnected: boolean = false;
  redisConnectionError: string | null = null;
  checkingConnection = false;

  // Operaciones
  isLoadingSet = false;
  isLoadingGet = false;
  isLoadingDelete = false;
  isLoadingFlush = false;

  // Resultados
  setResult: any = null;
  getResult: any = null;
  deleteResult: any = null;
  flushResult: any = null;

  // Variables de ejemplo
  testKey = 'usuario:123';
  testValue = {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    rol: 'admin'
  };

  private gatewayUrl = 'http://172.20.70.56:3000';  // D:\@Fernando\@proyectos\angular\gatewayUtil

  constructor() {
    // Verificar conexión a Redis al inicializar
    this.verificarConexionRedis();
  }

  /**
   * Verifica la conexión a Redis
   */
  verificarConexionRedis() {
    this.checkingConnection = true;
    this.redisConnectionError = null;

    this.http.get<any>(`${this.gatewayUrl}/health`)
      .subscribe({
        next: (response) => {
          if (response.redis === 'connected' || response.success) {
            this.redisConnected = true;
            console.log('… Conectado a Redis');
          } else {
            this.redisConnected = false;
            this.redisConnectionError = response.message || 'No se pudo conectar a Redis';
          }
          this.checkingConnection = false;
        },
        error: (error) => {
          this.redisConnected = false;
          this.redisConnectionError = `Error: ${error.message}. ¿Gateway levantado en 172.20.70.56:3000?`;
          console.error('Œ Error conectando a Redis:', error);
          this.checkingConnection = false;
        }
      });
  }

  /**
   * Crear una variable en Redis
   */
  crearVariableRedis() {
    if (!this.redisConnected) {
      alert('Redis no está conectado');
      return;
    }

    this.isLoadingSet = true;
    this.setResult = null;

    const payload = {
      value: this.testValue,
      ttl: 3600  // 1 hora
    };

    console.log(' Creando variable en Redis:', payload);

    this.http.post<any>(`${this.gatewayUrl}/api/cache/${this.testKey}`, payload)
      .subscribe({
        next: (response) => {
          this.setResult = {
            success: true,
            data: response,
            message: `… Variable '${this.testKey}' creada exitosamente`
          };
          console.log('… Variable creada:', response);
          this.isLoadingSet = false;
        },
        error: (error) => {
          this.setResult = {
            success: false,
            error: error.message,
            message: `Œ Error: ${error.message}`
          };
          console.error('Œ Error creando variable:', error);
          this.isLoadingSet = false;
        }
      });
  }

  /**
   * Obtener una variable de Redis
   */
  obtenerVariableRedis() {
    if (!this.redisConnected) {
      alert('Redis no está conectado');
      return;
    }

    this.isLoadingGet = true;
    this.getResult = null;

    console.log(' Obteniendo variable de Redis:', this.testKey);

    this.http.get<any>(`${this.gatewayUrl}/api/cache/${this.testKey}`)
      .subscribe({
        next: (response) => {
          this.getResult = {
            success: true,
            data: response,
            value: response.value,
            message: `… Variable '${this.testKey}' obtenida exitosamente`
          };
          console.log('… Variable obtenida:', response);
          this.isLoadingGet = false;
        },
        error: (error) => {
          this.getResult = {
            success: false,
            error: error.message,
            message: `Œ Error: ${error.message}`
          };
          console.error('Œ Error obteniendo variable:', error);
          this.isLoadingGet = false;
        }
      });
  }

  /**
   * Eliminar una variable de Redis
   */
  eliminarVariableRedis() {
    if (!this.redisConnected) {
      alert('Redis no está conectado');
      return;
    }

    if (!confirm(`¿Eliminar la variable '${this.testKey}'?`)) {
      return;
    }

    this.isLoadingDelete = true;
    this.deleteResult = null;

    console.log('‘¸ Eliminando variable de Redis:', this.testKey);

    this.http.delete<any>(`${this.gatewayUrl}/api/cache/${this.testKey}`)
      .subscribe({
        next: (response) => {
          this.deleteResult = {
            success: true,
            data: response,
            message: `… Variable '${this.testKey}' eliminada exitosamente`
          };
          console.log('… Variable eliminada:', response);
          this.isLoadingDelete = false;
        },
        error: (error) => {
          this.deleteResult = {
            success: false,
            error: error.message,
            message: `Œ Error: ${error.message}`
          };
          console.error('Œ Error eliminando variable:', error);
          this.isLoadingDelete = false;
        }
      });
  }

  /**
   * Limpiar todo Redis
   */
  flushRedis() {
    if (!this.redisConnected) {
      alert('Redis no está conectado');
      return;
    }

    if (!confirm('š ¸ ¿Estás seguro? Esto eliminará TODAS las claves de Redis. Esta acción no se puede deshacer.')) {
      return;
    }

    this.isLoadingFlush = true;
    this.flushResult = null;

    console.log('¥ Limpiando Redis...');

    this.http.post<any>(`${this.gatewayUrl}/api/cache/flush`, {})
      .subscribe({
        next: (response) => {
          this.flushResult = {
            success: true,
            data: response,
            message: `… Redis limpiado completamente`
          };
          console.log('… Redis limpiado:', response);
          this.isLoadingFlush = false;
        },
        error: (error) => {
          this.flushResult = {
            success: false,
            error: error.message,
            message: `Œ Error: ${error.message}`
          };
          console.error('Œ Error limpiando Redis:', error);
          this.isLoadingFlush = false;
        }
      });
  }
}


