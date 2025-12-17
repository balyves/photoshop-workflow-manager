/**
 * Export Multi-Formats
 */
var FORMATS = {
    "fb-feed": { name: "Facebook Feed", width: 1200, height: 630 },
    "insta-square": { name: "Instagram Square", width: 1080, height: 1080 },
    "insta-story": { name: "Instagram Story", width: 1080, height: 1920 },
    "linkedin": { name: "LinkedIn", width: 1200, height: 627 }
};

var params = { formats: ["fb-feed", "insta-square"] };

try {
    if (arguments.length > 0 && arguments[0]) {
        var paramsFile = new File(arguments[0]);
        if (paramsFile.exists) {
            paramsFile.open('r');
            params = JSON.parse(paramsFile.read());
            paramsFile.close();
        }
    }
} catch (e) {}

if (app.documents.length === 0) {
    alert("Aucun document ouvert");
} else {
    var doc = app.activeDocument;
    var docPath = doc.path;
    var docName = doc.name.replace(/\.[^\.]+$/, '');
    
    var outputFolder = new Folder(docPath + '/exports_social');
    if (!outputFolder.exists) outputFolder.create();
    
    var exported = [];
    
    for (var i = 0; i < params.formats.length; i++) {
        var formatId = params.formats[i];
        var format = FORMATS[formatId];
        if (!format) continue;
        
        try {
            var tempDoc = doc.duplicate(docName + "_" + formatId, true);
            if (tempDoc.mode !== DocumentMode.RGB) tempDoc.changeMode(ChangeMode.RGB);
            
            var srcRatio = tempDoc.width.as('px') / tempDoc.height.as('px');
            var targetRatio = format.width / format.height;
            
            if (srcRatio > targetRatio) {
                var newWidth = tempDoc.height.as('px') * targetRatio;
                var cropLeft = (tempDoc.width.as('px') - newWidth) / 2;
                tempDoc.crop([cropLeft, 0, cropLeft + newWidth, tempDoc.height.as('px')]);
            } else {
                var newHeight = tempDoc.width.as('px') / targetRatio;
                var cropTop = (tempDoc.height.as('px') - newHeight) / 2;
                tempDoc.crop([0, cropTop, tempDoc.width.as('px'), cropTop + newHeight]);
            }
            
            tempDoc.resizeImage(UnitValue(format.width, 'px'), UnitValue(format.height, 'px'), 72, ResampleMethod.BICUBICSHARPER);
            tempDoc.flatten();
            
            var outputFile = new File(outputFolder + '/' + docName + '_' + formatId + '.jpg');
            var jpegOptions = new JPEGSaveOptions();
            jpegOptions.quality = 10;
            tempDoc.saveAs(outputFile, jpegOptions, true, Extension.LOWERCASE);
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            exported.push(format.name);
        } catch (e) {}
    }
    
    alert("Exporté " + exported.length + " format(s):\n" + exported.join("\n"));
}
