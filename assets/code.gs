function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    var data = JSON.parse(e.postData.contents);
    var url = data.url;

    if (url) {
      sheet.appendRow([new Date(), url]);
      return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    } else {
      return ContentService.createTextOutput("No URL found").setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
  /**
 * GET handler: returns all rows of Sheet1 as JSON.
 */
function doGet(e) {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Sheet1");
  const data  = sheet.getDataRange().getValues(); // [ [timestamp, url], … ]
  
  // Skip header row if you have one
  const rows = data.slice(1).map(r => ({ timestamp: r[0], url: r[1] }));
  
  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
}
