package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.application.service.ScreenService;
import com.innovacred.bpm.domain.entity.ScreenDefinition;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/screens")
@RequiredArgsConstructor
public class ScreenRestController {

    private final ScreenService screenService;

    @GetMapping
    public List<ScreenDefinition> list() {
        return screenService.listAll();
    }

    @PostMapping
    public ScreenDefinition save(@RequestBody ScreenDefinition definition) {
        return screenService.save(definition);
    }

    @GetMapping("/process/{processKey}")
    public List<ScreenDefinition> listByProcess(@PathVariable String processKey) {
        return screenService.listByProcess(processKey);
    }

    @GetMapping("/task")
    public ScreenDefinition getForTask(@RequestParam String processKey, @RequestParam String taskKey) {
        return screenService.getForTask(processKey, taskKey).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        screenService.delete(id);
    }
}
