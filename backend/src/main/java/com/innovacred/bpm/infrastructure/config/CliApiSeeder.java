package com.innovacred.bpm.infrastructure.config;

import com.innovacred.bpm.domain.entity.ExternalProcess;
import com.innovacred.bpm.domain.entity.TramaField;
import com.innovacred.bpm.infrastructure.adapter.persistence.ExternalProcessRepository;
import com.innovacred.bpm.infrastructure.adapter.persistence.TramaFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CliApiSeeder implements CommandLineRunner {

    private final ExternalProcessRepository externalProcessRepository;
    private final TramaFieldRepository tramaFieldRepository;

    @Override
    public void run(String... args) throws Exception {
        Optional<ExternalProcess> processOpt = externalProcessRepository.findByCode("APICLI");
        if (processOpt.isPresent()) {
            ExternalProcess process = processOpt.get();
            seedCliTramas(process.getId());
        }
    }

    private void seedCliTramas(Long processId) {
        // Solo sembrar si no existen campos para evitar sobreescribir la configuración del usuario
        if (tramaFieldRepository.findByProcessId(processId).isEmpty()) {
            // INPUT
            TramaField rootIn = TramaField.builder()
                .processId(processId).tramaType("INPUT").name("_Root")
                .defaultAssignment("ASIGNAR SIEMPRE").build();
            rootIn = tramaFieldRepository.save(rootIn);
            
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("INPUT").name("DocumentType")
                .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE").defaultValue("C").build());
                
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("INPUT").name("DocumentNumber")
                .parentId(rootIn.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());

            // OUTPUT
            TramaField rootOut = TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("_Root")
                .defaultAssignment("ASIGNAR SIEMPRE").build();
            rootOut = tramaFieldRepository.save(rootOut);
            
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("interviniente_int_nombres_completos")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
                
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("DocumentNumber")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());

            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("interviniente_int_identificacion")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
                
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("correo")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
                
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("telefono")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
                
            tramaFieldRepository.save(TramaField.builder()
                .processId(processId).tramaType("OUTPUT").name("valorMaximoPrestamo")
                .parentId(rootOut.getId()).defaultAssignment("ASIGNAR SIEMPRE").build());
        }
    }
}
