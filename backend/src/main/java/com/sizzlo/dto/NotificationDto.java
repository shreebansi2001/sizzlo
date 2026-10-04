package com.sizzlo.dto;

public class NotificationDto {
    private Long id;
    private String type; // gift, calendar, sparkle, alert, tag
    private String title;
    private String desc;
    private String time;

    public NotificationDto() {}

    public NotificationDto(Long id, String type, String title, String desc, String time) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.desc = desc;
        this.time = time;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
