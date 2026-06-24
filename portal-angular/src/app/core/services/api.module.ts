import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Servicio HTTP simple
import { HttpService } from './http.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    HttpService
  ]
})
export class ApiModule {
  /**
   * Módulo simple para consumo de APIs
   *
   * Incluye:
   * - HttpService: Servicio HTTP básico con métodos GET, POST, PUT, DELETE
   *
   * Para usar este módulo, impórtalo en tu AppModule:
   * import { ApiModule } from './services/api.module';
   *
   * @NgModule({
   *   imports: [ApiModule]
   * })
   * export class AppModule { }
   */
}