# 🎨 Photoshop Workflow Manager

Application macOS pour centraliser et exécuter des scripts Photoshop par catégories de projets.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

<p align="center">
  <img src="docs/screenshot.png" alt="Screenshot" width="700">
</p>

---

## 📥 Installation (Utilisateur)

### Méthode simple : Télécharger l'application

1. Allez dans l'onglet **[Releases](../../releases)** de ce repository
2. Téléchargez le fichier `.dmg` de la dernière version
3. Ouvrez le `.dmg` et glissez l'application dans `/Applications`
4. Au premier lancement, faites **clic droit → Ouvrir** (sécurité macOS)

### Après l'installation

L'application créera automatiquement un dossier dans :
```
~/Documents/PhotoshopManager/
├── config.yaml      ← Configuration (modifiable)
├── presets/         ← Vos presets sauvegardés
└── scripts/         ← Vos scripts Photoshop
```

---

## 🛠️ Développement

### Prérequis

- **macOS** 10.14 ou plus récent
- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Adobe Photoshop** CC 2019+

### Installation locale

```bash
# 1. Cloner le repository
git clone https://github.com/VOTRE-USERNAME/photoshop-workflow-manager.git
cd photoshop-workflow-manager

# 2. Installer les dépendances
cd app
npm install

# 3. Lancer en mode développement
npm run dev
```

### Compiler l'application

```bash
# Créer le .app et .dmg
npm run build

# L'application sera dans : app/dist/
```

---

## 🚀 Automatisation GitHub

Ce projet utilise **GitHub Actions** pour compiler automatiquement l'application.

### Comment ça marche ?

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Tu fais un     │────▶│  GitHub compile  │────▶│  Tu télécharges │
│  git push       │     │  automatiquement │     │  le .app/.dmg   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Créer une nouvelle version

```bash
# 1. Commit tes modifications
git add .
git commit -m "Ma modification"

# 2. Créer un tag de version
git tag v1.0.1

# 3. Pousser le code ET le tag
git push origin main
git push origin v1.0.1
```

Après quelques minutes, une **Release** apparaîtra avec le `.dmg` à télécharger.

### Télécharger le build sans release

1. Allez dans l'onglet **Actions** de GitHub
2. Cliquez sur le dernier workflow "Build & Release"
3. En bas, section **Artifacts**, téléchargez `PhotoshopWorkflowManager-macOS`

---

## 📁 Structure du projet

```
photoshop-workflow-manager/
│
├── .github/
│   └── workflows/
│       └── build.yml          ← Automatisation GitHub
│
├── app/                        ← Application Electron
│   ├── src/
│   │   ├── main/
│   │   │   └── index.js       ← Process principal
│   │   └── renderer/
│   │       ├── index.html     ← Interface
│   │       ├── styles/
│   │       │   └── main.css   ← Styles
│   │       └── scripts/
│   │           └── renderer.js ← Logique UI
│   ├── assets/                 ← Icônes, images
│   └── package.json
│
├── scripts/                    ← Scripts Photoshop (.jsx)
│   ├── _common/               ← Scripts partagés
│   ├── presse/
│   ├── ecommerce/
│   ├── digital/
│   ├── still-life/
│   └── making-of/
│
├── presets/                    ← Presets par défaut
│
├── config.yaml                 ← Configuration principale
│
└── README.md
```

---

## ⚙️ Configuration

### Modifier les catégories et scripts

Éditez le fichier `config.yaml` :

```yaml
categories:
  - id: ma-categorie
    name: "Ma Catégorie"
    icon: "camera"
    color: "#E74C3C"
    
    scripts:
      - id: mon-script
        name: "Mon Script"
        file: "ma-categorie/mon-script.jsx"
        params:
          - id: largeur
            name: "Largeur"
            type: number
            default: 100
            unit: true
```

### Types de paramètres

| Type | Description | Exemple |
|------|-------------|---------|
| `number` | Champ numérique | Largeur, hauteur |
| `text` | Champ texte | Suffixe, nom |
| `select` | Liste déroulante | Format, profil |
| `boolean` | Case à cocher | Activer/désactiver |
| `range` | Slider | Qualité (0-100) |
| `multiselect` | Choix multiples | Formats d'export |

---

## 📜 Écrire un script Photoshop

### Template de base

```javascript
/**
 * Mon Script
 */

// Paramètres par défaut
var params = {
    monParam: "valeur"
};

// Lire les paramètres depuis l'app
try {
    if (arguments.length > 0 && arguments[0]) {
        var paramsFile = new File(arguments[0]);
        if (paramsFile.exists) {
            paramsFile.open('r');
            var content = paramsFile.read();
            paramsFile.close();
            params = JSON.parse(content);
        }
    }
} catch (e) {}

// Vérifier qu'un document est ouvert
if (app.documents.length === 0) {
    alert("Aucun document ouvert");
} else {
    var doc = app.activeDocument;
    
    // Ton code ici...
    
    alert("Terminé !");
}
```

---

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `⌘R` | Rafraîchir la configuration |
| `⌘Enter` | Exécuter le script |
| `⌘S` | Sauvegarder un preset |
| `Esc` | Fermer les modales |

---

## 🔧 Dépannage

### "Photoshop non trouvé"
Vérifiez que Photoshop est installé dans `/Applications` et qu'il autorise les scripts externes :
- **Préférences → Général → Activer les Scripts distants**

### L'application ne s'ouvre pas (macOS)
Faites **clic droit → Ouvrir** la première fois pour contourner Gatekeeper.

### Les modifications du config.yaml ne s'appliquent pas
Utilisez `⌘R` ou le bouton "Rafraîchir" dans l'application.

---

## 📄 License

MIT License - Voir [LICENSE](LICENSE)

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.
