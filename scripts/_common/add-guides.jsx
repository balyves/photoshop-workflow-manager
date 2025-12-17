/**
 * Add Guides / Ajouter des repères
 */
var params = { preset: "margins", top: 10, left: 10, _unit: "mm" };

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
    var originalUnit = app.preferences.rulerUnits;
    app.preferences.rulerUnits = params._unit === 'mm' ? Units.MM : Units.PIXELS;
    
    var docWidth = doc.width.as(params._unit || 'mm');
    var docHeight = doc.height.as(params._unit || 'mm');
    
    switch (params.preset) {
        case "margins":
            doc.guides.add(Direction.HORIZONTAL, UnitValue(params.top, params._unit));
            doc.guides.add(Direction.HORIZONTAL, UnitValue(docHeight - params.top, params._unit));
            doc.guides.add(Direction.VERTICAL, UnitValue(params.left, params._unit));
            doc.guides.add(Direction.VERTICAL, UnitValue(docWidth - params.left, params._unit));
            break;
        case "center":
            doc.guides.add(Direction.VERTICAL, UnitValue(docWidth / 2, params._unit));
            doc.guides.add(Direction.HORIZONTAL, UnitValue(docHeight / 2, params._unit));
            break;
    }
    
    app.preferences.rulerUnits = originalUnit;
    alert("Repères ajoutés (" + params.preset + ")");
}
