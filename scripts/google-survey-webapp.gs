/**
 * Кыялымдагы Кыргызстан — приём анкет в Google Sheets и письмо на почту.
 *
 * Куда вставить:
 * 1. Войдите в Google под Demilgefoundation@gmail.com.
 * 2. Создайте таблицу, например «Опрос Кыялымдагы Кыргызстан».
 * 3. Расширения → Apps Script. Удалите код по умолчанию и вставьте этот файл.
 * 4. Слева «Настройки проекта» (шестерёнка) → «Свойства скрипта» → добавить:
 *    SURVEY_TOKEN = длинный случайный секрет (тот же, что GOOGLE_SURVEY_TOKEN на сайте).
 *    DRIVE_FOLDER_URL = необязательная ссылка на папку Диска. Если пусто, в письме будет ссылка на таблицу.
 * 5. Развернуть → Новое развёртывание → тип «Веб-приложение».
 *    Выполнять от имени: Я
 *    У кого есть доступ: Все
 * 6. Скопируйте URL вида https://script.google.com/macros/s/.../exec
 *    в GOOGLE_SURVEY_WEBHOOK_URL на сервере сайта и перезапустите сайт.
 *
 * Письмо уходит с аккаунта, который развернул скрипт, на kyalymdagykyrgyzstanforum@gmail.com.
 */

var NOTIFY_EMAIL = "kyalymdagykyrgyzstanforum@gmail.com";

var HEADERS = [
  "ID",
  "Время",
  "Регион",
  "Тип местности",
  "Возраст",
  "Пол",
  "Род занятий",
  "Темы",
  "Темы: свой вариант",
  "Препятствия",
  "Препятствия: свой вариант",
  "Что сделать в первую очередь",
  "Предложения: свой вариант",
  "Открытый ответ",
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    var expected = PropertiesService.getScriptProperties().getProperty("SURVEY_TOKEN");
    if (!expected || body.token !== expected) return json_({ ok: false, error: "unauthorized" });

    var row = body.row || {};
    if (!row.id || !row.region || !row.change) return json_({ ok: false, error: "invalid" });

    var ss = spreadsheet_();
    var sheet = ss.getSheetByName("Ответы") || ss.insertSheet("Ответы");
    ensureHeader_(sheet);

    var duplicate = sheet.getRange("A:A").createTextFinder(String(row.id)).matchEntireCell(true).findNext();
    var url = ss.getUrl();
    var folder = PropertiesService.getScriptProperties().getProperty("DRIVE_FOLDER_URL") || url;
    if (duplicate) return json_({ ok: true, duplicate: true, url: url, mailed: true });

    sheet.appendRow([
      row.id,
      row.createdAt,
      row.region,
      row.locality,
      row.age,
      row.gender,
      row.employment,
      row.topics,
      row.topicsOther,
      row.barriers,
      row.barriersOther,
      row.priorities,
      row.prioritiesOther,
      row.change,
    ]);

    var mailed = true;
    try {
      var lines = [
        "Поступил новый анонимный ответ опроса «Кыялымдагы Кыргызстан».",
        "",
        "Регион: " + row.region,
        "Тип местности: " + row.locality,
        "Возраст: " + row.age,
        "Пол: " + row.gender,
        "Род занятий: " + row.employment,
        "Темы: " + row.topics,
      ];
      if (row.topicsOther) lines.push("Темы, свой вариант: " + row.topicsOther);
      lines.push("Препятствия: " + row.barriers);
      if (row.barriersOther) lines.push("Препятствия, свой вариант: " + row.barriersOther);
      lines.push("Что сделать в первую очередь: " + row.priorities);
      if (row.prioritiesOther) lines.push("Предложения, свой вариант: " + row.prioritiesOther);
      lines.push("Открытый ответ: " + row.change, "", "Таблица с результатами:", url, "", "Папка или таблица на Google Drive:", folder);
      MailApp.sendEmail({
        to: body.notifyEmail || NOTIFY_EMAIL,
        subject: "Новый ответ опроса «Кыялымдагы Кыргызстан»",
        body: lines.join("\n"),
      });
    } catch (mailError) {
      mailed = false;
      console.error(mailError);
    }

    return json_({ ok: true, url: url, mailed: mailed });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function spreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error("Откройте скрипт из таблицы или задайте SPREADSHEET_ID");
  return active;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
