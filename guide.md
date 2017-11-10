
https://developers.google.com/apps-script/guides/rest/quickstart/target-script?utm_campaign=execution-API-924&utm_source=gadbc&utm_medium=blog
# Part 1
1) Open the Apps Script editor and create a blank project.
2) Click on the "Untitled Project" title to rename the script. Name the script "Apps Script Execution API Quickstart Target" and click OK.
3) Replace the contents of the Code.gs file with the following:
# Part 2
1) In the code editor, select Publish > Deploy as API executable.
2) In the dialog that opens, leave the Version as "New" and enter "Target-v1" into the text box. Click Deploy.

```
/**
 * The function in this script will be called by the Apps Script Execution API.
 */

/**
 * Return the set of folder names contained in the user's root folder as an
 * object (with folder IDs as keys).
 * @return {Object} A set of folder names keyed by folder ID.
 */
function getFoldersUnderRoot() {
  var root = DriveApp.getRootFolder();
  var folders = root.getFolders();
  var folderSet = {};
  while (folders.hasNext()) {
    var folder = folders.next();
    folderSet[folder.getId()] = folder.getName();
  }
  return folderSet;
}
```
4) Save the project by selecting File > Save.

https://developers.google.com/apps-script/guides/rest/quickstart/python
1) Open your target Apps Script in the editor and select Resources > Cloud Platform project.
2) In the dialog that opens, click on the blue link (that starts with your script's name) at the top to open the console project associated with your script.
3) The left sidebar should say API Manager. If it does not, click the icon in the upper-left to open a side panel and select API Manager. Select Library in the left sidebar.
4) In the search bar under the Google APIs tab, enter "Google Apps Script Execution API". Click the same name in the list that appears. In the new tab that opens, click Enable API.
5) Click Credentials in the left sidebar.
6) Select the Credentials tab, click the Create credentials button and select OAuth client ID.
7) Select the application type Other, enter the name "Google Apps Script Execution API Quickstart", and click the Create button.
8) Click OK to dismiss the resulting dialog.
9) Click the file_download (Download JSON) button to the right of the client ID.
10) Move this file to your working directory and rename it client_secret.json.





https://developers.google.com/apps-script/guides/rest/api