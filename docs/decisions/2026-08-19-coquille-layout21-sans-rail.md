# Coquille — layout-21 à l'identique, sans le rail

**Date** : 2026-08-19
**Statut** : ✅ ACTÉ — séance de cadrage
**Portée** : `shared/layout`, `styles/tokens.css`, navigation

---

## Pourquoi une séance de cadrage

La fiche Tiers a été redessinée trois fois. La règle posée avec Arbi : **chaque
décision de coquille se discute une fois, se motive, et ne se rediscute plus.** Ce
document est la trace de cette séance ; on s'y réfère au lieu de rouvrir le débat.

---

## Les décisions

### 1. Le template : layout-21, à l'identique

Cadre conservé — marges de page, coins arrondis, la zone de travail flotte dans un
fond gris. Police, tailles, espacements : inchangés.

**Motif.** Un back-office se juge à l'usage, pas sur une capture. Aucun écran n'existe
encore : discuter du cadre avant d'avoir un tableau à l'écran, c'est arbitrer à vide.
Le cadre se retire en changeant quatre valeurs le jour où un écran réel prouve qu'il
coûte trop de surface — pas avant.

### 2. Le rail d'icônes est supprimé

**Motif.** Son utilité décroît avec le nombre de modules : six icônes se mémorisent,
quinze forment un mur de pictogrammes. Il coûtait 70 px sur toute la hauteur et
**deux gestes** pour atteindre un écran. Ce qui plaisait dans le rail — la couleur par
module — est conservé : elle passe sur les icônes des entrées du menu.

Retirer le rail n'est pas mutiler le template : **ADR-F01** pose que Metronic est une
source, jamais une dépendance.

### 3. Navigation par métier, pas par découpage serveur

```
EXPLOITATION   Tiers · Réservations · Dossiers
OFFRE          Produits · Tarification · Contrats (V2)
FINANCE        Facturation · Règlements · Caisse
PILOTAGE       Statistiques · Journal
VUES ENREGISTRÉES
───────────────────────────────────────────────
PARAMÈTRES     Réf. commun · Réf. hébergement · Permissions ·
               Documents & Emails · Change · Utilisateurs · Provider
```

**Motif.** La liste des quinze modules décrit le **serveur**. Cinq seulement sont
quotidiens ; certains (`Core`, `Log`, `Provider`) ne sont pas des écrans. Les mettre au
même niveau noierait ce qui compte. Les sept modules de configuration se règlent une
fois : un écran Paramètres les range sans les cacher.

*Correction apportée en séance : `Produits` et `Tarification` sont quotidiens — ils
étaient mal classés. `Contracting` les rejoindra après V1.*

### 4. Le bureau s'affiche, il ne se choisit pas

Le bureau est écrit en clair sous le nom du produit. Un sélecteur n'apparaît que si
l'utilisateur en a plusieurs — cas estimé à 1 sur 1000.

**Motif.** Le bureau n'est pas une préférence, c'est un **filtre sur tout ce qui est
visible** (RLS). Sans lui à l'écran, un agent qui ne trouve pas un client conclut que
le client n'existe pas. Le message serait faux, et silencieux.

### 5. Le menu utilisateur passe en haut à droite

**Motif.** Convention quasi universelle, et notre barre du haut porte déjà les outils
globaux. Laisser le compte en bas séparerait « moi » de « mes réglages » aux deux
extrémités de l'écran. Le **nom reste visible** (pas seulement l'avatar) : plusieurs
agents partagent un poste au comptoir, et agir sous la session d'un autre se paie dans
l'historique.

### 6. La recherche vit en haut à droite

**Motif.** Elle cherche dans **toute** l'application, pas dans le module courant : sa
place est au-dessus du contenu, pas dans la colonne qui liste les écrans. Elle reste
aussi visible quand la colonne est repliée.

### 7. Replier la colonne la fait disparaître

Pas de bande d'icônes résiduelle : la colonne s'efface, le contenu prend toute la
largeur, un bouton la ramène.

**Motif.** Une bande d'icônes sans libellés est exactement ce que le rail apportait et
qu'on vient de retirer. La faire revenir par le repli reproduirait le défaut.

### 8. La densité entre dans le socle

Deux variables — hauteur de ligne (`--ui-row`) et échelle du texte (`--ui-scale`) —
lues par chaque composant dès sa création.

**Motif.** Le coût annoncé en début de semaine (« trop cher ») portait sur le
**rattrapage** de 206 tailles déjà écrites en dur. La bibliothèque repart de zéro : le
coût marginal est nul si on l'intègre tout de suite, et prohibitif si on l'ajoute
après. C'est le premier bénéfice concret de la décision de reprendre.

**Garantie limitée, et assumée** : on garantit chaque axe séparément et on vérifie
réellement **trois préréglages nommés** — comptoir dense, standard, confort grand
écran. Le produit cartésien des combinaisons n'est pas testable ; le promettre serait
mentir.

---

## Ce qui reste statique, et ne nous engage pas

Compteurs du menu, vues enregistrées, contenu de Paramètres : inventés pour qu'Arbi
juge un menu **rempli**. Rien n'est engageant tant que les écrans n'existent pas ;
chaque valeur porte son marquage et sa source à nommer.
