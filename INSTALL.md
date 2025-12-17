# 🚀 Guide d'installation rapide

## Pour créer ton repository GitHub

### 1. Créer le repo sur GitHub

1. Va sur [github.com/new](https://github.com/new)
2. Nom du repository : `photoshop-workflow-manager`
3. Description : `Gestionnaire de workflows Photoshop`
4. Laisse coché "Public" (ou "Private" si tu préfères)
5. **Ne coche PAS** "Add a README file" (on en a déjà un)
6. Clique sur **Create repository**

### 2. Envoyer le code

Ouvre Terminal sur ton Mac et exécute :

```bash
# 1. Va dans le dossier du projet (ajuste le chemin)
cd ~/Downloads/photoshop-manager

# 2. Initialise Git
git init

# 3. Ajoute tous les fichiers
git add .

# 4. Premier commit
git commit -m "🎉 Initial commit"

# 5. Connecte au repo GitHub (remplace VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/photoshop-workflow-manager.git

# 6. Envoie le code
git branch -M main
git push -u origin main
```

### 3. Télécharger l'application compilée

Après le push, GitHub va automatiquement compiler l'application :

1. Va sur ton repo GitHub
2. Clique sur l'onglet **Actions**
3. Attends que le workflow "Build & Release" soit ✅
4. Clique dessus, puis en bas sur **Artifacts**
5. Télécharge `PhotoshopWorkflowManager-macOS`

### 4. Créer une Release (optionnel)

Pour créer une version téléchargeable publiquement :

```bash
# Crée un tag de version
git tag v1.0.0

# Pousse le tag
git push origin v1.0.0
```

Une Release sera automatiquement créée avec le `.dmg` !

---

## En cas de problème

### "npm: command not found"
Installe Node.js : https://nodejs.org/

### Le build échoue sur GitHub
Vérifie que tous les fichiers sont bien présents dans le commit.

### L'app ne s'ouvre pas sur macOS
Fais **clic droit → Ouvrir** la première fois (sécurité Gatekeeper).
