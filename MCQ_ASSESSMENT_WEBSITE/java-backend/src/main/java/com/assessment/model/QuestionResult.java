package com.assessment.model;

import java.util.List;

public class QuestionResult {
    private String text;
    private List<String> options;
    private String selectedOption;
    private String correctOption;
    private boolean isCorrect;
    private String imageUrl;

    // Getters and Setters
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }

    public String getCorrectOption() { return correctOption; }
    public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

    public boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(boolean correct) { this.isCorrect = correct; }
}
