package com.chatterboxapp.repository;

import com.chatterboxapp.entity.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

  @EntityGraph(attributePaths = "variants")
  List<Message> findByThreadIdOrderByCreatedAtAsc(Long threadId);

  @EntityGraph(attributePaths = "variants")
  Optional<Message> findByIdAndThreadId(Long id, Long threadId);
}
