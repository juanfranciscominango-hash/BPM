package com.innovacred.bpm.infrastructure.adapter.rest;

import com.innovacred.bpm.domain.entity.Menu;
import com.innovacred.bpm.infrastructure.adapter.persistence.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuRestController {

    private final MenuRepository menuRepository;

    @GetMapping
    public List<Menu> getMenu() {
        return menuRepository.findByParentIsNullOrderBySortOrderAsc();
    }

    @PostMapping
    public Menu create(@RequestBody Menu menu) {
        if (menu.getParentId() != null) {
            menu.setParent(menuRepository.findById(menu.getParentId()).orElse(null));
        }
        return menuRepository.save(menu);
    }

    @PutMapping("/{id}")
    public Menu update(@PathVariable Long id, @RequestBody Menu menuDetails) {
        Menu menu = menuRepository.findById(id).orElseThrow(() -> new RuntimeException("Menu no encontrado"));
        menu.setTitle(menuDetails.getTitle());
        menu.setIcon(menuDetails.getIcon());
        menu.setRoute(menuDetails.getRoute());
        menu.setPermissionCode(menuDetails.getPermissionCode());
        menu.setSortOrder(menuDetails.getSortOrder());
        menu.setActive(menuDetails.isActive());
        
        if (menuDetails.getParentId() != null) {
            menu.setParent(menuRepository.findById(menuDetails.getParentId()).orElse(null));
        } else {
            menu.setParent(null);
        }
        
        return menuRepository.save(menu);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        menuRepository.deleteById(id);
    }
}
