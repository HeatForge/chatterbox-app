package com.chatterboxapp.repository;

import com.chatterboxapp.entity.ChatThread;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatThreadRepository extends JpaRepository<ChatThread, Long> {

  List<ChatThread> findByUserIdAndProjectIdIsNullOrderByUpdatedAtDesc(Long userId);

  List<ChatThread> findByUserIdAndProjectIdOrderByUpdatedAtDesc(Long userId, Long projectId);

  Optional<ChatThread> findByIdAndUserId(Long id, Long userId);
}
