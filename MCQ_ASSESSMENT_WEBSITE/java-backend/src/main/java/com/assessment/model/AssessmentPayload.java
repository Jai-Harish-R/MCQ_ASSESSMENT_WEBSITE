package com.assessment.model;

import java.util.List;

public class AssessmentPayload {
    private String studentEmail;
    private String teacherEmail;
    private String testTitle;
    private int score;
    private int totalQuestions;
    private List<QuestionResult> questions;

    // Getters and Setters
    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public String getTestTitle() { return testTitle; }
    public void setTestTitle(String testTitle) { this.testTitle = testTitle; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public List<QuestionResult> getQuestions() { return questions; }
    public void setQuestions(List<QuestionResult> questions) { this.questions = questions; }
}
