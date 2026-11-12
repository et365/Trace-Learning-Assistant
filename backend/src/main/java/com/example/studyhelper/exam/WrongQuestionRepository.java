package com.example.studyhelper.exam;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WrongQuestionRepository extends JpaRepository<WrongQuestion, Long> {
    List<WrongQuestion> findByPaperIdOrderByIdAsc(Long paperId);
    List<WrongQuestion> findAllByOrderByIdDesc();
    List<WrongQuestion> findByDeletedTrue();
    long countByDeletedTrue();
    void deleteAllByDeletedTrue();
}
