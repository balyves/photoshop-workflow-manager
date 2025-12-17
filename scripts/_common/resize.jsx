/**
 * Resize / Redimensionner
 */
var params = { width: null, height: null, keepRatio: true };

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
    var newWidth, newHeight;
    
    if (params.width && params.height && !params.keepRatio) {
        newWidth = UnitValue(parseFloat(params.width), 'px');
        newHeight = UnitValue(parseFloat(params.height), 'px');
    } else if (params.width) {
        newWidth = UnitValue(parseFloat(params.width), 'px');
        var ratio = doc.height.as('px') / doc.width.as('px');
        newHeight = UnitValue(newWidth.as('px') * ratio, 'px');
    } else if (params.height) {
        newHeight = UnitValue(parseFloat(params.height), 'px');
        var ratio = doc.width.as('px') / doc.height.as('px');
        newWidth = UnitValue(newHeight.as('px') * ratio, 'px');
    }
    
    if (newWidth && newHeight) {
        doc.resizeImage(newWidth, newHeight, doc.resolution, ResampleMethod.BICUBIC);
        alert("Redimensionné: " + Math.round(doc.width.as('px')) + " × " + Math.round(doc.height.as('px')) + " px");
    }
}
