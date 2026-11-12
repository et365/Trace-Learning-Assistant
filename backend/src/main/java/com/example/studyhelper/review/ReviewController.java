package com.example.studyhelper.review;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) { this.service = service; }

    @GetMapping("/today")
    public List<ReviewService.ReviewDto> today() {
        return service.todaySection();
    }

    @PostMapping
    public ReviewService.ReviewDto start(@RequestBody ReviewService.StartRequest req) {
        return service.start(req.wrongId());
    }

    @PostMapping("/{id}/pass")
    public ReviewService.ReviewDto pass(@PathVariable Long id) {
        return service.pass(id);
    }

    @PostMapping("/{id}/fail")
    public ReviewService.ReviewDto fail(@PathVariable Long id) {
        return service.fail(id);
    }

    @DeleteMapping("/{id}")
    public void cancel(@PathVariable Long id) {
        service.cancel(id);
    }
}
