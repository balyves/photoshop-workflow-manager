/**
 * Amazon Main Image
 */
var params = { size: "2000", whiteBackground: true };

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
    var size = parseInt(params.size) || 2000;
    
    app.preferences.rulerUnits = Units.PIXELS;
    
    if (doc.mode !== DocumentMode.RGB) {
        doc.changeMode(ChangeMode.RGB);
    }
    doc.convertProfile('sRGB IEC61966-2.1', Intent.RELATIVECOLORIMETRIC, true, true);
    
    var width = doc.width.as('px');
    var height = doc.height.as('px');
    var maxDim = Math.max(width, height);
    
    if (width !== height) {
        doc.resizeCanvas(UnitValue(maxDim, 'px'), UnitValue(maxDim, 'px'), AnchorPosition.MIDDLECENTER);
    }
    
    if (params.whiteBackground) {
        var bgLayer = doc.artLayers.add();
        bgLayer.name = "Fond Blanc";
        bgLayer.move(doc, ElementPlacement.PLACEATEND);
        var white = new SolidColor();
        white.rgb.red = 255;
        white.rgb.green = 255;
        white.rgb.blue = 255;
        doc.selection.selectAll();
        doc.selection.fill(white);
        doc.selection.deselect();
    }
    
    doc.resizeImage(UnitValue(size, 'px'), UnitValue(size, 'px'), 72, ResampleMethod.BICUBICSHARPER);
    doc.flatten();
    
    var outputFile = new File(doc.path + '/' + doc.name.replace(/\.[^\.]+$/, '') + '_AMAZON.jpg');
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = 12;
    doc.saveAs(outputFile, jpegOptions, true, Extension.LOWERCASE);
    
    alert("Image Amazon créée: " + size + "×" + size + " px");
}
