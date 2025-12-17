/**
 * Create Print Document
 */
var params = { width: 210, height: 297, resolution: 300, bleed: 3, colorProfile: "fogra39", _unit: "mm" };

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

var profiles = {
    "fogra39": "Coated FOGRA39 (ISO 12647-2:2004)",
    "fogra51": "Coated FOGRA51 (ISO 12647-2:2013)",
    "gracol": "GRACoL2006_Coated1v2"
};

var bleed = parseFloat(params.bleed) || 3;
var totalWidth = parseFloat(params.width) + (bleed * 2);
var totalHeight = parseFloat(params.height) + (bleed * 2);

var doc = app.documents.add(
    UnitValue(totalWidth, params._unit || 'mm'),
    UnitValue(totalHeight, params._unit || 'mm'),
    parseInt(params.resolution) || 300,
    "Document Print",
    NewDocumentMode.CMYK,
    DocumentFill.WHITE
);

try {
    doc.convertProfile(profiles[params.colorProfile] || profiles["fogra39"], Intent.RELATIVECOLORIMETRIC, true, true);
} catch (e) {}

app.preferences.rulerUnits = Units.MM;
doc.guides.add(Direction.HORIZONTAL, UnitValue(bleed, 'mm'));
doc.guides.add(Direction.HORIZONTAL, UnitValue(totalHeight - bleed, 'mm'));
doc.guides.add(Direction.VERTICAL, UnitValue(bleed, 'mm'));
doc.guides.add(Direction.VERTICAL, UnitValue(totalWidth - bleed, 'mm'));

alert("Document créé: " + params.width + "×" + params.height + " mm\nFonds perdus: " + bleed + " mm");
