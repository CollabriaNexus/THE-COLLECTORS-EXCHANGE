// JSON API over this sheet, for Claude to read and write.
// Every request needs ?token=... matching the
// API_TOKEN script property. Run setupToken() once
// to mint one, then deploy as a web app.

function doGet(e) {
  return route(e.parameter || {});
}

function doPost(e) {
  var p = e.parameter || {};
  if (e.postData && e.postData.contents) {
    var b = JSON.parse(e.postData.contents);
    for (var k in b) {
      p[k] = b[k];
    }
  }
  return route(p);
}

function route(p) {
  try {
    if (!auth(p.token)) {
      return out({ok: false, error: 'bad token'});
    }
    if (p.action === 'read') {
      return out(read(p.sheet));
    }
    if (p.action === 'update') {
      return out(update(p));
    }
    if (p.action === 'append') {
      return out(append(p));
    }
    if (p.action === 'remove') {
      return out(remove(p));
    }
    if (p.action === 'sheets') {
      return out({ok: true, sheets: tabs()});
    }
    return out({ok: false, error: 'bad action'});
  } catch (err) {
    return out({ok: false, error: err.message});
  }
}

function auth(token) {
  var props = PropertiesService.getScriptProperties();
  var want = props.getProperty('API_TOKEN');
  if (!want || !token) {
    return false;
  }
  return token === want;
}

function tabs() {
  var all = SpreadsheetApp.getActive().getSheets();
  return all.map(function (s) {
    return s.getName();
  });
}

function read(name) {
  var sheet = pick(name);
  var data = sheet.getDataRange().getDisplayValues();
  if (data.length < 2) {
    return {ok: true, headers: [], rows: []};
  }
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {_row: i + 1};
    var empty = true;
    for (var j = 0; j < headers.length; j++) {
      if (!headers[j]) {
        continue;
      }
      obj[headers[j]] = data[i][j];
      if (data[i][j] !== '') {
        empty = false;
      }
    }
    if (!empty) {
      rows.push(obj);
    }
  }
  return {
    ok: true,
    sheet: sheet.getName(),
    headers: headers,
    rows: rows
  };
}

// col can be a header name, a letter, or an index.
function update(p) {
  var sheet = pick(p.sheet);
  var row = parseInt(p.row, 10);
  if (!row || row < 2) {
    throw new Error('row must be 2 or more');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var col = colOf(sheet, p.col);
    var val = p.value == null ? '' : p.value;
    sheet.getRange(row, col).setValue(val);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return {ok: true, row: row};
}

// values is a JSON object keyed by header name.
function append(p) {
  var sheet = pick(p.sheet);
  var vals = p.values;
  if (typeof vals === 'string') {
    vals = JSON.parse(vals);
  }
  if (!vals) {
    throw new Error('need values');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var row;
    if (Array.isArray(vals)) {
      row = vals;
    } else {
      row = heads(sheet).map(function (h) {
        return vals[h] == null ? '' : vals[h];
      });
    }
    sheet.appendRow(row);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return {ok: true, row: sheet.getLastRow()};
}

function remove(p) {
  var sheet = pick(p.sheet);
  var row = parseInt(p.row, 10);
  if (!row || row < 2) {
    throw new Error('row must be 2 or more');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet.deleteRow(row);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return {ok: true, row: row};
}

function heads(sheet) {
  var last = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, last).getValues()[0];
}

function colOf(sheet, col) {
  if (!col) {
    throw new Error('need col');
  }
  var hs = heads(sheet);
  var want = String(col).toLowerCase();
  for (var i = 0; i < hs.length; i++) {
    if (String(hs[i]).toLowerCase() === want) {
      return i + 1;
    }
  }
  if (/^[A-Za-z]+$/.test(col)) {
    var n = 0;
    var up = col.toUpperCase();
    for (var j = 0; j < up.length; j++) {
      n = n * 26 + (up.charCodeAt(j) - 64);
    }
    return n;
  }
  var idx = parseInt(col, 10);
  if (idx > 0) {
    return idx;
  }
  throw new Error('no column: ' + col);
}

function pick(name) {
  var ss = SpreadsheetApp.getActive();
  if (!name) {
    return ss.getActiveSheet();
  }
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('no sheet: ' + name);
  }
  return sheet;
}

function out(obj) {
  var text = JSON.stringify(obj);
  var svc = ContentService;
  return svc.createTextOutput(text)
    .setMimeType(svc.MimeType.JSON);
}

// Run this once from the editor.
// The token prints to the execution log.
function setupToken() {
  var t = Utilities.getUuid().replace(/-/g, '');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('API_TOKEN', t);
  Logger.log('API_TOKEN = ' + t);
  return t;
}
