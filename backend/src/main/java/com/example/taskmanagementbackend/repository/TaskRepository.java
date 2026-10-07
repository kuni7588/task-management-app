package com.example.taskmanagementbackend.repository;

import com.example.taskmanagementbackend.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // 指定したユーザーが所有するタスク一覧を取得する。
    List<Task> findByUserId(Long userId);

    // タスクIDと所有者のユーザーIDが、両方一致するタスクを取得する。
    // 一致するタスクがない場合は、空のOptionalを返す。
    Optional<Task> findByTaskIdAndUserId(Long taskId, Long userId);
}