/**
 * Кыялымдагы Кыргызстан — анкеты и регистрации делегаций: таблица и письмо.
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
 * Письма анкеты и регистрации делегации уходят на kyalymdagykyrgyzstanforum@gmail.com.
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

function doGet() {
  return json_({ ok: true, service: "survey" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    var expected = PropertiesService.getScriptProperties().getProperty("SURVEY_TOKEN");
    if (!expected || body.token !== expected) return json_({ ok: false, error: "unauthorized" });
    if (body.kind === "delegation") return delegation_(body);

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
        to: NOTIFY_EMAIL,
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

var DELEGATION_HEADERS = [
  "Код",
  "Время",
  "ФИО",
  "Должность",
  "Телефон",
  "Email",
  "Тип организации",
  "Область",
  "Район",
  "Организация",
  "Участников",
  "Координирует",
];

var PARTICIPANT_HEADERS = ["Код делегации", "ФИО", "Возраст", "Пол", "Регион", "Район", "Организация"];

function delegation_(body) {
  var item = body.delegation || {};
  if (!item.code || !item.fullName || !item.organizationName) return json_({ ok: false, error: "invalid" });

  var ss = spreadsheet_();
  var sheet = ss.getSheetByName("Делегации") || ss.insertSheet("Делегации");
  ensureHeader_(sheet, DELEGATION_HEADERS);
  var peopleSheet = ss.getSheetByName("Участники") || ss.insertSheet("Участники");
  ensureHeader_(peopleSheet, PARTICIPANT_HEADERS);

  var url = ss.getUrl();
  var duplicate = sheet.getRange("A:A").createTextFinder(String(item.code)).matchEntireCell(true).findNext();
  if (duplicate) return json_({ ok: true, duplicate: true, url: url, mailed: true });

  sheet.appendRow([
    item.code,
    item.createdAt,
    item.fullName,
    item.position,
    item.phone,
    item.email,
    item.organizationType,
    item.region,
    item.district,
    item.organizationName,
    item.participantCount,
    item.willCoordinate,
  ]);

  var people = item.participants || [];
  if (people.length) {
    var values = [];
    for (var i = 0; i < people.length; i++) {
      var person = people[i] || {};
      values.push([item.code, person.fullName, person.age, person.gender, person.region, person.district, person.organization]);
    }
    peopleSheet.getRange(peopleSheet.getLastRow() + 1, 1, values.length, PARTICIPANT_HEADERS.length).setValues(values);
  }

  var mailed = true;
  try {
    var lines = [
      "Новая регистрация делегации «Кыялымдагы Кыргызстан».",
      "",
      "Регистрационный номер: " + item.code,
      "Время: " + item.createdAt,
      "ФИО: " + item.fullName,
      "Должность: " + item.position,
      "Телефон: " + item.phone,
      "Email: " + item.email,
      "Тип организации: " + item.organizationType,
      "Область: " + item.region,
      "Район: " + item.district,
      "Организация: " + item.organizationName,
      "Участников: " + item.participantCount,
      "Координирует делегацию: " + item.willCoordinate,
      "",
      "Участники:",
    ];
    for (var n = 0; n < people.length; n++) {
      var member = people[n] || {};
      lines.push((n + 1) + ". " + member.fullName + ", " + member.age + ", " + member.gender + ", " + member.region + ", " + member.district + ", " + member.organization);
    }
    lines.push("", "Таблица:", url);
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Новая делегация «Кыялымдагы Кыргызстан» — " + item.code,
      body: lines.join("\n"),
    });
  } catch (mailError) {
    mailed = false;
    console.error(mailError);
  }

  return json_({ ok: true, url: url, mailed: mailed });
}

function ensureHeader_(sheet, headers) {
  var row = headers || HEADERS;
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(row);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, row.length).setFontWeight("bold");
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
