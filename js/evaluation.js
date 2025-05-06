// Barème des réponses correctes (pour les questions fermées)
const correctAnswers = {
  q1: 'interactivite',
  q2: 'faux',
  q4a: 'B',
  q4b: 'A',
  q4c: 'D',
  q4d: 'C',
  q5a: 'idee / concept',
  q5b: 'prototypage',
  q5c: 'programmation',
  q5d: 'tests',
  q5e: 'lancement',
  q6: 'unity',
  q7: 'faux',
  q9: 'planning',
  q10a: 'B',
  q10b: 'D',
  q10c: 'C',
  q10d: 'A',
  q11: 'difficulte',
  q12: 'vrai',
  q14a: 'Atari 2600',
  q14b: 'NES',
  q14c: 'PlayStation',
  q14d: 'Nintendo Switch',
  q15: 'diff/sauvegarde',
  q16: 'faux',
  q18a: 'D',
  q18b: 'C',
  q18c: 'A',
  q18d: 'B',
  q19: 'bugs'
};

// Questions ouvertes à corriger automatiquement par mots-clés
const openQuestions = [
  'q3', 'q8', 'q13', 'q17', 'q20'
];

// Mots-clés attendus pour chaque question ouverte
const openKeywords = {
  q3: ['html', 'structure', 'langage', 'web'],
  q8: ['balise', 'fermeture', 'slash', 'syntaxe'],
  q13: ['css', 'design', 'couleur', 'style'],
  q17: ['javascript', 'interaction', 'animation', 'comportement'],
  q20: ['responsive', 'mobile', 'media queries', 'adaptation']
};

// Questions à classement (ordre à respecter)
const rankingQuestions = {
  q5: ['Idée / Concept', 'Prototypage', 'Programmation', 'Tests', 'Lancement'],
  q14: ['Atari 2600', 'NES', 'PlayStation', 'Nintendo Switch']
};

// Questions à relier (tableaux)
const matchingQuestions = {
  q4: ['B', 'A', 'D', 'C'],
  q10: ['B', 'D', 'C', 'A'],
  q18: ['D', 'C', 'A', 'B']
};

// Validation du formulaire
function validateForm() {
  const form = document.getElementById('evaluation-form');
  let valid = true;
  let firstInvalid = null;

  // Vérification de tous les champs requis
  Array.from(form.elements).forEach(el => {
    if (
      el.hasAttribute('required') &&
      ((el.type === 'radio' && !form.querySelector(`[name="${el.name}"]:checked`)) ||
      (el.type !== 'radio' && !el.value.trim()))
    ) {
      valid = false;
      if (!firstInvalid) firstInvalid = el;
      el.classList.add('input-error');
    } else {
      el.classList.remove('input-error');
    }
  });

  if (!valid && firstInvalid) {
    alert('Merci de remplir tous les champs obligatoires.');
    firstInvalid.focus();
  }
  return valid;
}

// Correction et calcul du score
function calculateScore() {
  let score = 0;
  let maxScore = 0;

  // QCM, Vrai/Faux, Sélections simples
  for (const key in correctAnswers) {
    maxScore++;
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) continue;
    if (el.type === 'radio') {
      const checked = document.querySelector(`[name="${key}"]:checked`);
      if (checked && checked.value === correctAnswers[key]) {
        score++;
      }
    } else if (el.tagName === 'SELECT') {
      if (el.value === correctAnswers[key]) {
        score++;
      }
    } else if (el.type === 'text') {
      if (el.value.trim().toLowerCase() === correctAnswers[key].toLowerCase()) {
        score++;
      }
    }
  }

  // Correction automatique des questions ouvertes par mots-clés
  for (const key of openQuestions) {
    maxScore++;
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) continue;
    const userAnswer = el.value.trim().toLowerCase();
    const keywords = openKeywords[key] || [];
    let found = 0;
    keywords.forEach(kw => {
      if (userAnswer.includes(kw)) found++;
    });
    // 1 point si au moins la moitié des mots-clés sont présents (arrondi supérieur)
    if (found >= Math.ceil(keywords.length / 2)) {
      score++;
    }
  }

  // Classement (ordre exact requis)
  // Q5
  let q5ok = true;
  for (let i = 0; i < rankingQuestions.q5.length; i++) {
    const val = document.querySelector(`[name="q5${String.fromCharCode(97 + i)}"]`).value.trim().toLowerCase();
    if (val !== rankingQuestions.q5[i].toLowerCase()) q5ok = false;
  }
  if (q5ok) score++; // 1 point pour l'ordre parfait

  // Q14
  let q14ok = true;
  for (let i = 0; i < rankingQuestions.q14.length; i++) {
    const val = document.querySelector(`[name="q14${String.fromCharCode(97 + i)}"]`).value.trim().toLowerCase();
    if (val !== rankingQuestions.q14[i].toLowerCase()) q14ok = false;
  }
  if (q14ok) score++; // 1 point pour l'ordre parfait

  // À relier (tableaux)
  // Q4
  let q4ok = true;
  ['a', 'b', 'c', 'd'].forEach((s, i) => {
    const val = document.querySelector(`[name="q4${s}"]`).value;
    if (val !== matchingQuestions.q4[i]) q4ok = false;
  });
  if (q4ok) score++;

  // Q10
  let q10ok = true;
  ['a', 'b', 'c', 'd'].forEach((s, i) => {
    const val = document.querySelector(`[name="q10${s}"]`).value;
    if (val !== matchingQuestions.q10[i]) q10ok = false;
  });
  if (q10ok) score++;

  // Q18
  let q18ok = true;
  ['a', 'b', 'c', 'd'].forEach((s, i) => {
    const val = document.querySelector(`[name="q18${s}"]`).value;
    if (val !== matchingQuestions.q18[i]) q18ok = false;
  });
  if (q18ok) score++;

  // Ajustement du maxScore pour les questions à classement/à relier (1 point chacune)
  maxScore += 5;

  return { score, maxScore };
}

// Initialisation du système de drag & drop
function initDragAndDrop() {
  const draggableItems = document.querySelectorAll('.draggable-item');
  const dropZones = document.querySelectorAll('.drop-zone');

  // Initialise les éléments glissables
  draggableItems.forEach(item => {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', function(e) {
      this.classList.add('dragging');
      e.dataTransfer.setData('text/plain', this.textContent);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => {
        this.classList.add('draggable-ghost');
      }, 0);
    });

    item.addEventListener('dragend', function() {
      this.classList.remove('dragging', 'draggable-ghost');
    });
  });

  // Initialise les zones de dépôt
  dropZones.forEach(zone => {
    zone.addEventListener('dragenter', function(e) {
      e.preventDefault();
      this.classList.add('drag-hover');
    });

    zone.addEventListener('dragover', function(e) {
      e.preventDefault(); // C'est nécessaire pour permettre le drop
      e.dataTransfer.dropEffect = 'move';
    });

    zone.addEventListener('dragleave', function() {
      this.classList.remove('drag-hover');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-hover');

      // Récupére le texte de l'élément glissé
      const data = e.dataTransfer.getData('text/plain');

      // Vide la zone de dépôt actuelle
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }

      // Crée un nouvel élément pour la zone de dépôt
      const newItem = document.createElement('div');
      newItem.classList.add('draggable-item');
      newItem.textContent = data;
      newItem.setAttribute('draggable', 'true');

      // Ajoute l'élément à la zone de dépôt
      this.appendChild(newItem);

      // Met à jour le champ caché
      const inputName = this.dataset.input;
      if (inputName) {
        document.querySelector(`input[name="${inputName}"]`).value = data;
      }

      // Réapplique les événements de glisser-déposer au nouvel élément
      newItem.addEventListener('dragstart', function(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.textContent);
        setTimeout(() => {
          this.classList.add('draggable-ghost');
        }, 0);
      });

      newItem.addEventListener('dragend', function() {
        this.classList.remove('dragging', 'draggable-ghost');
      });
    });
  });
}

// Initialiser après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  initDragAndDrop();

  const originalValidateForm = window.validateForm || function() { return true; };
  window.validateForm = function() {
    const dropZones = document.querySelectorAll('.drop-zone[data-input]');
    let allZonesFilled = true;

    dropZones.forEach(zone => {
      if (!zone.firstChild) {
        allZonesFilled = false;
        zone.classList.add('input-error');
      } else {
        zone.classList.remove('input-error');
      }
    });

    if (!allZonesFilled) {
      alert('Veuillez remplir toutes les zones de classement.');
      return false;
    }

    return originalValidateForm();
  };
});

// Feedback selon la note
function generateFeedback(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  let comment = '';
  if (percentage >= 90) {
    comment = "🔥 Excellent travail ! Tu maîtrises vraiment le contenu. Continue comme ça !";
  } else if (percentage >= 75) {
    comment = "👍 Bon boulot ! Quelques points à revoir, mais tu es sur la bonne voie.";
  } else if (percentage >= 55) {
    comment = "🧐 Pas mal, mais il reste des notions à approfondir. Un petit coup d'œil sur le site te fera progresser.";
  } else {
    comment = "🤔 Il serait utile de relire le contenu pour bien tout comprendre. Courage, tu vas y arriver !";
  }
  return comment;
}

// Affichage des corrections après soumission
function showCorrections() {
  // Pour chaque question fermée, on affiche la correction
  for (const key in correctAnswers) {
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) continue;
    let userVal = '';
    if (el.type === 'radio') {
      const checked = document.querySelector(`[name="${key}"]:checked`);
      userVal = checked ? checked.value : '';
    } else if (el.tagName === 'SELECT' || el.type === 'text') {
      userVal = el.value;
    }
    // Ajout visuel
    if (userVal === correctAnswers[key]) {
      el.closest('li, tr, td, label').style.backgroundColor = '#d7fbe7';
    } else {
      el.closest('li, tr, td, label').style.backgroundColor = '#ffe0e0';
    }
  }

  // Correction visuelle des questions ouvertes par mots-clés
  for (const key of openQuestions) {
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) continue;
    const userAnswer = el.value.trim().toLowerCase();
    const keywords = openKeywords[key] || [];
    let found = 0;
    keywords.forEach(kw => {
      if (userAnswer.includes(kw)) found++;
    });
    const isCorrect = found >= Math.ceil(keywords.length / 2);
    el.closest('li, tr, td, label').style.backgroundColor = isCorrect ? '#d7fbe7' : '#ffe0e0';
  }
}

// Ajout d'un scroll automatique vers le résultat
function scrollToResult() {
  const resultDiv = document.getElementById('result-feedback');
  if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Affichage du résultat et du feedback
function displayResult(score, maxScore, feedback) {
  let resultDiv = document.getElementById('result-feedback');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = 'result-feedback';
    resultDiv.style.marginTop = '32px';
    resultDiv.style.padding = '20px';
    resultDiv.style.border = '2.5px solid var(--primary-color)';
    resultDiv.style.borderRadius = '16px';
    resultDiv.style.backgroundColor = 'var(--surface-color)';
    resultDiv.style.color = 'var(--secondary-color)';
    resultDiv.style.fontWeight = '700';
    resultDiv.style.fontSize = '1.25rem';
    document.getElementById('evaluation-form').appendChild(resultDiv);
  }
  // Calcul de la note sur 20, arrondie à 2 décimales
  const note20 = Math.round((score / maxScore) * 20 * 100) / 100;
  resultDiv.innerHTML = `
    <span>Ta note : <strong>${score} / ${maxScore}</strong> (<strong>${note20} / 20</strong>)</span><br>
    <span>${feedback}</span>
    <br><br>
    <button id="show-corrections-btn" style="margin-top:10px;">Voir les corrections</button>
    <button id="restart-btn" style="margin-left:15px;">Recommencer</button>
  `;
  document.getElementById('show-corrections-btn').onclick = showCorrections;
  document.getElementById('restart-btn').onclick = () => window.location.reload();
  scrollToResult();
}

// Surlignage temps réel des champs invalides
function setupRealtimeValidation() {
  const form = document.getElementById('evaluation-form');
  Array.from(form.elements).forEach(el => {
    el.addEventListener('input', () => {
      if (el.hasAttribute('required') && el.value.trim()) {
        el.classList.remove('input-error');
      }
    });
  });
}

// Gestion de la soumission du formulaire
function handleSubmit(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const { score, maxScore } = calculateScore();
  const feedback = generateFeedback(score, maxScore);

  displayResult(score, maxScore, feedback);

  // Désactivation du formulaire pour éviter les doubles soumissions
  event.target.querySelector('button[type="submit"]').disabled = true;
}

// Barre de progression dynamique
function setupProgressBar() {
  const form = document.getElementById('evaluation-form');
  let progress = document.createElement('div');
  progress.id = 'progress-bar';
  progress.style.height = '8px';
  progress.style.background = 'linear-gradient(90deg, var(--primary-color), var(--accent-color))';
  progress.style.borderRadius = '8px';
  progress.style.marginBottom = '30px';
  progress.style.transition = 'width 0.3s';
  progress.style.width = '0%';
  form.prepend(progress);

  form.addEventListener('input', () => {
    const total = Array.from(form.elements).filter(el =>
      el.name && !['appreciation', 'amelioration', 'nom', 'prenom', 'classe', 'niveau', 'email'].includes(el.name)
    ).length;
    const filled = Array.from(form.elements).filter(el =>
      el.name && !['appreciation', 'amelioration', 'nom', 'prenom', 'classe', 'niveau', 'email'].includes(el.name) &&
      ((el.type === 'radio' && form.querySelector(`[name="${el.name}"]:checked`)) ||
      (el.type !== 'radio' && el.value.trim()))
    ).length;
    progress.style.width = `${Math.round((filled / total) * 100)}%`;
  });
}

// Autres modifs UX
function UXmodifs() {
  // Focus sur le premier champ
  document.getElementById('debut').elements[0].focus();
  // Bouton "Remonter en haut"
  let scrollBtn = document.createElement('button');
  scrollBtn.id = 'scroll-top-button';
  scrollBtn.type = 'button';
  scrollBtn.innerHTML = '⬆ Haut de page';
  scrollBtn.style.position = 'fixed';
  scrollBtn.style.bottom = '20px';
  scrollBtn.style.right = '20px';
  scrollBtn.style.display = 'none';
  scrollBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
  document.body.appendChild(scrollBtn);

  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
  });
}

// Configuration des boutons Vrai/Faux
document.addEventListener('DOMContentLoaded', setupVraiFauxButtons);
function setupVraiFauxButtons() {
  document.querySelectorAll('.vrai-faux-group').forEach(group => {
    group.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        group.querySelectorAll('.vrai-faux-btn').forEach(btn => btn.classList.remove('selected'));
        input.closest('.vrai-faux-btn').classList.add('selected');
      });
    });
  });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('evaluation-form').addEventListener('submit', handleSubmit);
  setupRealtimeValidation();
  setupProgressBar();
  UXmodifs();
  setupVraiFauxButtons();
});
