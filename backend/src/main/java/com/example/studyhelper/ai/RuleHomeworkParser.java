package com.example.studyhelper.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 老师消息规则解析：按序号拆分任务、识别科目、【】注释转说明、
 * 「注意…部分同学」拆为选做项、清理表情与贴图。移植自交互原型并验证过的规则。
 */
@Component
public class RuleHomeworkParser {

    public record ParsedItem(String txt, String note, boolean optional) {}
    public record ParsedHomework(String subject, List<ParsedItem> items) {}

    private static final String[] SUBJECT_KEYS = {"语文", "数学", "英语", "科学", "体育", "美术", "道法"};
    private static final Pattern HEAD = Pattern.compile("【([^】]{1,12})】");
    private static final Pattern NOTICE = Pattern.compile("^(?:注意|温馨提示|备注|提醒)\\s*[：:]?\\s*(.+)$");
    private static final Pattern CONDITIONAL = Pattern.compile("^(部分同学|个别同学)(.+)$");

    public ParsedHomework parse(String raw) {
        String subject = null;
        var head = HEAD.matcher(raw);
        if (head.find()) {
            for (String s : SUBJECT_KEYS) {
                if (head.group(1).contains(s)) { subject = s; break; }
            }
        }

        List<ParsedItem> items = new ArrayList<>();
        int lineNo = 0;
        for (String rawLine : raw.split("\\n+")) {
            int idx = lineNo++;
            String line = rawLine.trim();
            if (line.isEmpty()) continue;
            if (idx == 0 && subject != null
                    && HEAD.matcher(line).find()
                    && line.replaceFirst("【[^】]*】", "").trim().isEmpty()) {
                continue;
            }

            String body = line
                    .replaceAll("【(?:提高内容|内容|要求|说明|提示)[:：]?([^】]*)】", "（$1）")
                    .replaceAll("【([^】]*)】", "（$1）")
                    .replaceAll("\\[[^\\]]{1,8}\\]", "")
                    .replaceAll("[\\x{1F300}-\\x{1FAFF}\\x{2700}-\\x{27BF}\\x{FE0F}]", "")
                    .replaceFirst("^\\s*(?:[（(]\\d{1,2}[)）]|[①-⑩]|\\d{1,2}[.、．)）])\\s*", "")
                    .trim()
                    .replaceAll("[。．；;]\\s*$", "");
            if (body.isEmpty()) continue;

            var notice = NOTICE.matcher(body);
            if (notice.matches() && !items.isEmpty()) {
                String noteTxt = notice.group(1).replaceAll("[。]\\s*$", "").trim();
                var cond = CONDITIONAL.matcher(noteTxt);
                if (cond.matches()) {
                    String txt = cond.group(2).replaceAll("哦*\\s*[!!。]*\\s*$", "").trim();
                    items.add(new ParsedItem(txt, "老师提醒：" + cond.group(1) + "适用", true));
                } else {
                    var last = items.get(items.size() - 1);
                    String merged = last.note() == null || last.note().isEmpty() ? noteTxt : last.note() + "；" + noteTxt;
                    items.set(items.size() - 1, new ParsedItem(last.txt(), merged, last.optional()));
                }
                continue;
            }
            items.add(new ParsedItem(body, "", false));
        }
        return new ParsedHomework(subject, items);
    }
}
