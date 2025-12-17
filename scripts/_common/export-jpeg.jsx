/**
 * Export JPEG
 */
var params = { quality: 85, suffix: "" };

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
    var outputFile = new File(docPath + '/' + docName + (params.suffix || '') + '.jpg');
    
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = parseInt(params.quality) || 85;
    jpegOptions.embedColorProfile = true;
    
    doc.saveAs(outputFile, jpegOptions, true, Extension.LOWERCASE);
    alert("Exporté: " + outputFile.name);
}
