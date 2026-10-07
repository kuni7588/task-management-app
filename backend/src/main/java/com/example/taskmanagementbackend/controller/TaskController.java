package com.example.taskmanagementbackend.controller;

import com.example.taskmanagementbackend.entity.Task;
import com.example.taskmanagementbackend.repository.UserRepository;
import com.example.taskmanagementbackend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(
            TaskService taskService,
            UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }

    /**
     * サーバー側の認証情報から、ログインユーザーのIDを取得する。
     * 画面から送られたuserIdは使用しない。
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED))
                .getUserId();
    }

    /**
     * ログインユーザーのタスク一覧を取得する。
     * GET /api/tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        List<Task> tasks = taskService.findByUserId(userId);

        return ResponseEntity.ok(tasks);
    }

    /**
     * ログインユーザーが所有するタスクを1件取得する。
     * GET /api/tasks/{taskId}
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTask(
            @PathVariable("taskId") Long taskId,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        Optional<Task> task = taskService.findById(taskId, userId);

        return task
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * ログインユーザーのタスクとして登録する。
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody Task task,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        Task createdTask = taskService.create(task, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTask);
    }

    /**
     * ログインユーザーが所有するタスクだけ更新する。
     * PUT /api/tasks/{taskId}
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(
            @PathVariable("taskId") Long taskId,
            @Valid @RequestBody Task task,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        Optional<Task> updatedTask =
                taskService.update(taskId, task, userId);

        return updatedTask
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * ログインユーザーが所有するタスクだけ削除する。
     * DELETE /api/tasks/{taskId}
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable("taskId") Long taskId,
            Authentication authentication) {

        Long userId = getCurrentUserId(authentication);
        boolean deleted = taskService.delete(taskId, userId);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}