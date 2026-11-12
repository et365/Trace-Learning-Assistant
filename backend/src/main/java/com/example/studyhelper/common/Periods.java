package com.example.studyhelper.common;

import java.util.List;

public final class Periods {

    public record Period(int index, String name, String time) {}

    public static final List<Period> ALL = List.of(
            new Period(0, "早读", "08:25"),
            new Period(1, "第1节", "08:30"),
            new Period(2, "第2节", "09:25"),
            new Period(3, "第3节", "10:40"),
            new Period(4, "第4节", "13:20"),
            new Period(5, "第5节", "14:20"),
            new Period(6, "第6节", "15:15"));

    public static final String[] DAYS = {"", "周一", "周二", "周三", "周四", "周五"};

    private Periods() {}

    public static Period period(int index) {
        if (index < 0 || index >= ALL.size()) throw new IllegalArgumentException("节次不合法：" + index);
        return ALL.get(index);
    }

    public static String typeLabel(String type) {
        return switch (type) {
            case "T" -> "课堂";
            case "F" -> "加练";
            case "K" -> "任务";
            default -> "任务";
        };
    }
}
