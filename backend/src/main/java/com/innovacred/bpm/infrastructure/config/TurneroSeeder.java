package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.TuServicio;
import com.innovacred.bpm.domain.entity.TuVentanilla;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuServicioRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TuVentanillaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TurneroSeeder implements CommandLineRunner {

    private final TuServicioRepository servicioRepository;
    private final TuVentanillaRepository ventanillaRepository;

    @Override
    public void run(String... args) {
        sembrarServicios();
        sembrarVentanillas();
    }

    private void sembrarServicios() {
        if (servicioRepository.count() == 0) {
            log.info("[TurneroSeeder] Sembrando servicios por defecto en INC_GESTION_TURNOS...");
            servicioRepository.saveAll(List.of(
                    TuServicio.builder().codigo("PREFERENCIAL").nombre("Atención Preferencial / 3ra Edad").prefijo("P").prioridad(1).slaEsperaMinutos(10).activo(true).build(),
                    TuServicio.builder().codigo("CAJAS").nombre("Cajas, Pagos y Depósitos").prefijo("C").prioridad(5).slaEsperaMinutos(15).activo(true).build(),
                    TuServicio.builder().codigo("ATENCION").nombre("Atención al Cliente y Consultas").prefijo("A").prioridad(5).slaEsperaMinutos(15).activo(true).build(),
                    TuServicio.builder().codigo("CREDITO").nombre("Créditos e Inversiones").prefijo("CR").prioridad(5).slaEsperaMinutos(20).activo(true).build()
            ));
            log.info("[TurneroSeeder] Servicios sembrados exitosamente.");
        }
    }

    private void sembrarVentanillas() {
        if (ventanillaRepository.count() == 0) {
            log.info("[TurneroSeeder] Sembrando ventanillas por defecto...");
            ventanillaRepository.saveAll(List.of(
                    TuVentanilla.builder().numeroVentanilla(1).nombre("Ventanilla 1").agencia("Matriz").estado("DISPONIBLE").build(),
                    TuVentanilla.builder().numeroVentanilla(2).nombre("Ventanilla 2").agencia("Matriz").estado("DISPONIBLE").build(),
                    TuVentanilla.builder().numeroVentanilla(3).nombre("Ventanilla 3").agencia("Matriz").estado("DISPONIBLE").build(),
                    TuVentanilla.builder().numeroVentanilla(4).nombre("Ventanilla 4").agencia("Matriz").estado("DISPONIBLE").build()
            ));
            log.info("[TurneroSeeder] Ventanillas sembradas exitosamente.");
        }
    }
}
