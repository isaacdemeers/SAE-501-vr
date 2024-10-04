
# LIENS

[FIGMA](https://www.figma.com/design/WFw8hvJnmhebn9sWFGQKTY/Fred-%2F-Isaac?node-id=1-236&t=Ci1FzpvWjvnzIhet-1)

[EXEMPLE STANDALONE](https://sae-vr.fredtrivett.com/)

# EDITEUR

#### PRÉREQUIS:
- Docker
- Node.js

#### COMMENT FONCTIONNE L'EDITEUR:
- Aller dans `/dist` et installer les dépendances :
```javascript
cd /dist
npm i
```
- Compose Up du fichier `/compose.yml`
```javascript
docker-compose up
```
- Aller sur le **[localhost:3000](http://localhost:3000/)** pour visualiser le l'éditeur



# STANDALONE

#### OU TROUVER LE STANDALONE:
https://github.com/isaacdemeers/sae-501-vr/tree/Standalone



#### COMMENT FONCTIONNE LE STANDALONE:

- Ajouter les assets de l'éditeur dans le dossier `assets` du standalone.
- Ajouter le fichier `project.json` à la racine du dossier.
- Lancer le projet via Live Server de VS Code.

