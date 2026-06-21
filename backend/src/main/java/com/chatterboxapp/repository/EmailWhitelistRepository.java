package com.chatterboxapp.repository;

import com.chatterboxapp.entity.EmailWhitelist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailWhitelistRepository extends JpaRepository<EmailWhitelist, Long> {

  boolean existsByEmailIgnoreCase(String email);
}
