package com.healthverse.aianalysis.repository;

import com.healthverse.aianalysis.entity.SymptomHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomHistoryRepository extends MongoRepository<SymptomHistory, String> {
    List<SymptomHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
