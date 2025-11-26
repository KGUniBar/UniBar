package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Menu;
import org.example.repository.MenuRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    private static final String FIXED_OWNER_ID = "1";

    public List<Menu> getMenus() {
        return menuRepository.findByOwnerIdOrderByCreatedAtAsc(FIXED_OWNER_ID);
    }

    public Menu createMenu(Menu menu) {
        menu.setId(null); // MongoDB가 ID 생성
        menu.setOwnerId(FIXED_OWNER_ID);
        menu.setMenuId(System.currentTimeMillis());
        menu.setCreatedAt(LocalDateTime.now());
        return menuRepository.save(menu);
    }

    public Menu updateMenu(String id, Menu updated) {
        Menu menu = menuRepository.findByIdAndOwnerId(id, FIXED_OWNER_ID)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
        menu.setName(updated.getName());
        menu.setPrice(updated.getPrice());
        return menuRepository.save(menu);
    }

    public void deleteMenu(String id) {
        Menu menu = menuRepository.findByIdAndOwnerId(id, FIXED_OWNER_ID)
                .orElseThrow(() -> new RuntimeException("Menu not found"));
        menuRepository.delete(menu);
    }
}
