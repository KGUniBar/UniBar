package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Menu;
import org.example.service.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // 메뉴 목록 조회
    @GetMapping
    public ResponseEntity<List<Menu>> getMenus() {
        return ResponseEntity.ok(menuService.getMenus());
    }

    // 메뉴 등록
    @PostMapping
    public ResponseEntity<Menu> createMenu(@RequestBody Menu menu) {
        return ResponseEntity.ok(menuService.createMenu(menu));
    }

    // 메뉴 수정
    @PutMapping("/{id}")
    public ResponseEntity<Menu> updateMenu(@PathVariable String id, @RequestBody Menu menu) {
        return ResponseEntity.ok(menuService.updateMenu(id, menu));
    }

    // 메뉴 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable String id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}
