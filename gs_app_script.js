data = {};
folderIds = [];

function traverseFolder(rootId) {
  var folderObj = DriveApp.getFolderById(rootId);
  var folderId = folderObj.getId();
  folderIds.push(folderId);
  var subFolders = folderObj.getFolders();

  while(subFolders.hasNext()) {
    traverseFolder(subFolders.next().getId());
  }
}

function getFileMetadata(fileId, folderId) {
  var fileObj = DriveApp.getFileById(fileId);
  return {
    "title": fileObj.getName(),
    "description": fileObj.getDescription(),
    "type": fileObj.getMimeType(),
    "parent_id": folderId,
    "link": fileObj.getUrl(),
    "form_data": getFormJson(fileObj.getUrl())
  };
}

function listFolderContents(folderId) {
  var folderObj = DriveApp.getFolderById(folderId);
  var filesObj = folderObj.getFiles();
  var fileIds = [];
  while(filesObj.hasNext()) {
    var fileObj = filesObj.next();
    var type = fileObj.getMimeType();
    var regexp = new RegExp("\.form$");
    if ((regexp.test(type) == true)) {
      fileIds.push(fileObj.getId());
    }
  }
  return fileIds;
}

/*
 MIT License

 Copyright (c) 2016 Humanitas

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * Converts the given form edit URL into a JSON object.
 */

function getFormJson(form_edit_url) {

    var form = FormApp.openByUrl(form_edit_url);
    var items = form.getItems();

    var result = {
        "metadata": getFormMetadata(form),
        "items": items.map(itemToObject),
        "count": items.length
    };

    return JSON.stringify(result);
}

/**
 * Returns the form metadata object for the given Form object.
 * @param form: Form
 * @returns (Object) object of form metadata.
 */
function getFormMetadata(form) {
    return {
        "title": form.getTitle(),
        "id": form.getId(),
        "description": form.getDescription(),
        "publishedUrl": form.getPublishedUrl(),
        "editorEmails": form.getEditors().map(function(user) {return user.getEmail()}),
        "count": form.getItems().length,
        "confirmationMessage": form.getConfirmationMessage(),
        "customClosedFormMessage": form.getCustomClosedFormMessage()
    };
}

/**
 * Returns an Object for a given Item.
 * @param item: Item
 * @returns (Object) object for the given item.
 */
function itemToObject(item) {
    var data = {};

    data.type = item.getType().toString();

    // Downcast items to access type-specific properties

    var itemTypeConstructorName = snakeCaseToCamelCase("AS_" + item.getType().toString() + "_ITEM");
    var typedItem = item[itemTypeConstructorName]();

    // Keys with a prefix of "get" have "get" stripped

    var getKeysRaw = Object.keys(typedItem).filter(function(s) {return s.indexOf("get") == 0});

    getKeysRaw.map(function(getKey) {
        var propName = getKey[3].toLowerCase() + getKey.substr(4);

        // Image data, choices, and type come in the form of objects / enums
        if (["image", "choices", "type", "alignment"].indexOf(propName) != -1) {return};

        // Skip feedback-related keys
        if ("getFeedbackForIncorrect".equals(getKey) || "getFeedbackForCorrect".equals(getKey)
            || "getGeneralFeedback".equals(getKey)) {return};

        var propValue = typedItem[getKey]();

        data[propName] = propValue;
    });

    // Bool keys are included as-is

    var boolKeys = Object.keys(typedItem).filter(function(s) {
        return (s.indexOf("is") == 0) || (s.indexOf("has") == 0) || (s.indexOf("includes") == 0);
    });

    boolKeys.map(function(boolKey) {
        var propName = boolKey;
        var propValue = typedItem[boolKey]();
        data[propName] = propValue;
    });

    // Handle image data and list choices

    switch (item.getType()) {
        case FormApp.ItemType.LIST:
        case FormApp.ItemType.CHECKBOX:
        case FormApp.ItemType.MULTIPLE_CHOICE:
            data.choices = typedItem.getChoices().map(function(choice) {
                return choice.getValue();
            });
            break;

        case FormApp.ItemType.IMAGE:
            data.alignment = typedItem.getAlignment().toString();

            if (item.getType() == FormApp.ItemType.VIDEO) {
                return;
            }

            var imageBlob = typedItem.getImage();

            data.imageBlob = {
                "dataAsString": imageBlob.getDataAsString(),
                "name": imageBlob.getName(),
                "isGoogleType": imageBlob.isGoogleType()
            };

            break;

        case FormApp.ItemType.PAGE_BREAK:
            data.pageNavigationType = typedItem.getPageNavigationType().toString();
            break;

        default:
            break;
    }

    // Have to do this because for some reason Google Scripts API doesn't have a
    // native VIDEO type
    if (item.getType().toString() === "VIDEO") {
        data.alignment = typedItem.getAlignment().toString();
    }

    return data;
}

/**
 * Converts a SNAKE_CASE string to a camelCase string.
 * @param s: string in snake_case
 * @returns (string) the camelCase version of that string
 */
function snakeCaseToCamelCase(s) {
    return s.toLowerCase().replace(/(\_\w)/g, function(m) {return m[1].toUpperCase();});
}

//////////////////////////////////////////////////////


function main(rootId) {
  traverseFolder(rootId);
  for (var i = 0; i < folderIds.length; i++) {
    var fileIds = listFolderContents(folderIds[i]);
    for (var j = 0; j < fileIds.length; j++) {
      data[fileIds[j]] = getFileMetadata(fileIds[j], folderIds[i]);
    }
  }
  return data;
}