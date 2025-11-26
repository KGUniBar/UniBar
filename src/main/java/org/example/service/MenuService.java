package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.exception.ResourceNotFoundException;
import org.example.model.Menu;
import org.example.repository.MenuRepository;
import org.example.util.SecurityUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;
    private final SecurityUtil securityUtil;

    public List<Menu> getMenus() {
        String ownerId = securityUtil.getCurrentUserId();
        return menuRepository.findByOwnerIdOrderByCreatedAtAsc(ownerId);
    }

    public Menu createMenu(Menu menu) {
        String ownerId = securityUtil.getCurrentUserId();

        menu.setId(null); // MongoDB가 ID 생성
        menu.setOwnerId(ownerId);
        menu.setMenuId(System.currentTimeMillis());
        menu.setCreatedAt(LocalDateTime.now());
        return menuRepository.save(menu);
    }

    public Menu updateMenu(String id, Menu updated) {
        String ownerId = securityUtil.getCurrentUserId();

        Menu menu = menuRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다."));
        menu.setName(updated.getName());
        menu.setPrice(updated.getPrice());
        return menuRepository.save(menu);
    }

    public void deleteMenu(String id) {
        String ownerId = securityUtil.getCurrentUserId();

        Menu menu = menuRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("메뉴를 찾을 수 없습니다."));
        menuRepository.delete(menu);
    }
}
