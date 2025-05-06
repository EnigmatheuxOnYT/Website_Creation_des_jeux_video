// Barèmes et données de correction
const correctAnswers = {
  q1: 'interactivite',
  q2: 'faux',
  q4a: 'B', q4b: 'A', q4c: 'D', q4d: 'C',
  q5a: 'idee / concept', q5b: 'prototypage', q5c: 'programmation', q5d: 'tests', q5e: 'lancement',
  q6: 'unity',
  q7: 'faux',
  q9: 'planning',
  q10a: 'B', q10b: 'D', q10c: 'C', q10d: 'A',
  q11: 'difficulte',
  q12: 'vrai',
  q14a: 'Atari 2600', q14b: 'NES', q14c: 'PlayStation', q14d: 'Nintendo Switch',
  q15: 'diff/sauvegarde',
  q16: 'faux',
  q18a: 'D', q18b: 'C', q18c: 'A', q18d: 'B',
  q19: 'bugs'
};

const openQuestions = ['q3', 'q8', 'q13', 'q17', 'q20'];
const openKeywords = {
  q3: ['html', 'structure', 'langage', 'web'],
  q8: ['balise', 'fermeture', 'slash', 'syntaxe'],
  q13: ['css', 'design', 'couleur', 'style'],
  q17: ['javascript', 'interaction', 'animation', 'comportement'],
  q20: ['responsive', 'mobile', 'media queries', 'adaptation']
};

const rankingQuestions = {
  q5: ['Idée / Concept', 'Prototypage', 'Programmation', 'Tests', 'Lancement'],
  q14: ['Atari 2600', 'NES', 'PlayStation', 'Nintendo Switch']
};

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

  Array.from(form.elements).forEach(el => {
    if (
      el.hasAttribute('required') &&
      (
        (el.type === 'radio' && !form.querySelector(`[name="${el.name}"]:checked`)) ||
        (el.type !== 'radio' && !el.value.trim())
      )
    ) {
      valid = false;
      if (!firstInvalid) firstInvalid = el;
      el.classList.add('input-error');
    } else {
      el.classList.remove('input-error');
    }
  });

  // Validation des zones de classement drag & drop
  document.querySelectorAll('.drop-zone[data-input]').forEach(zone => {
    if (!zone.firstChild) {
      valid = false;
      if (!firstInvalid) firstInvalid = zone;
      zone.classList.add('input-error');
    } else {
      zone.classList.remove('input-error');
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
  let score = 0, maxScore = 0;

  // QCM, Vrai/Faux, Sélections simples
  Object.entries(correctAnswers).forEach(([key, expected]) => {
    maxScore++;
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) return;
    if (el.type === 'radio') {
      const checked = document.querySelector(`[name="${key}"]:checked`);
      if (checked && checked.value === expected) score++;
    } else if (el.tagName === 'SELECT') {
      if (el.value === expected) score++;
    } else if (el.type === 'text') {
      if (el.value.trim().toLowerCase() === expected.toLowerCase()) score++;
    }
  });

  // Questions ouvertes par mots-clés
  openQuestions.forEach(key => {
    maxScore++;
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) return;
    const userAnswer = el.value.trim().toLowerCase();
    const keywords = openKeywords[key] || [];
    const found = keywords.filter(kw => userAnswer.includes(kw)).length;
    if (found >= Math.ceil(keywords.length / 2)) score++;
  });

  // Classement exact
  ['q5', 'q14'].forEach(q => {
    const items = rankingQuestions[q];
    let ok = true;
    items.forEach((val, i) => {
      const input = document.querySelector(`[name="${q}${String.fromCharCode(97 + i)}"]`);
      if (!input || input.value.trim().toLowerCase() !== val.toLowerCase()) ok = false;
    });
    maxScore++;
    if (ok) score++;
  });

  // Tableaux à relier
  ['q4', 'q10', 'q18'].forEach(q => {
    let ok = true;
    ['a', 'b', 'c', 'd'].forEach((s, i) => {
      const val = document.querySelector(`[name="${q}${s}"]`).value;
      if (val !== matchingQuestions[q][i]) ok = false;
    });
    maxScore++;
    if (ok) score++;
  });

  return { score, maxScore };
}

// Drag & Drop
function initDragAndDrop() {
  const draggableItems = document.querySelectorAll('.draggable-item');
  const dropZones = document.querySelectorAll('.drop-zone');

  function setupDraggable(item) {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', function (e) {
      this.classList.add('dragging');
      e.dataTransfer.setData('text/plain', this.textContent);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => this.classList.add('draggable-ghost'), 0);
    });
    item.addEventListener('dragend', function () {
      this.classList.remove('dragging', 'draggable-ghost');
    });
  }

  draggableItems.forEach(setupDraggable);

  dropZones.forEach(zone => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt =>
      zone.addEventListener(evt, e => e.preventDefault())
    );
    zone.addEventListener('dragenter', function () {
      this.classList.add('drag-hover');
    });
    zone.addEventListener('dragleave', function () {
      this.classList.remove('drag-hover');
    });
    zone.addEventListener('drop', function (e) {
      this.classList.remove('drag-hover');
      const data = e.dataTransfer.getData('text/plain');
      // Un seul item par zone
      this.innerHTML = '';
      const newItem = document.createElement('div');
      newItem.className = 'draggable-item';
      newItem.textContent = data;
      setupDraggable(newItem);
      this.appendChild(newItem);
      // Mise à jour input caché
      const inputName = this.dataset.input;
      if (inputName) {
        document.querySelector(`input[name="${inputName}"]`).value = data;
      }
    });
  });
}

// === Feedback selon la note ===
function generateFeedback(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return "🔥 Excellent travail ! Tu maîtrises vraiment le contenu. Continue comme ça ! PS : Tu es le GOAT !";
  if (percentage >= 75) return "👍 Bon boulot ! Quelques points à revoir, mais tu es sur la bonne voie.";
  if (percentage >= 55) return "🧐 Pas mal, mais il reste des notions à approfondir. Un petit coup d'œil sur le site te fera progresser.";
  return "🤔 Il serait utile de relire le contenu pour bien tout comprendre. Courage, tu vas y arriver !";
}

// === Affichage des corrections ===
function showCorrections() {
  // Questions fermées
  Object.entries(correctAnswers).forEach(([key, expected]) => {
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) return;
    let userVal = '';
    if (el.type === 'radio') {
      const checked = document.querySelector(`[name="${key}"]:checked`);
      userVal = checked ? checked.value : '';
    } else if (el.tagName === 'SELECT' || el.type === 'text') {
      userVal = el.value;
    }
    const parent = el.closest('li, tr, td, label');
    if (parent) parent.style.backgroundColor = (userVal === expected) ? '#d7fbe7' : '#ffe0e0';
  });

  // Questions ouvertes
  openQuestions.forEach(key => {
    const el = document.querySelector(`[name="${key}"]`);
    if (!el) return;
    const userAnswer = el.value.trim().toLowerCase();
    const keywords = openKeywords[key] || [];
    const found = keywords.filter(kw => userAnswer.includes(kw)).length;
    const isCorrect = found >= Math.ceil(keywords.length / 2);
    const parent = el.closest('li, tr, td, label');
    if (parent) parent.style.backgroundColor = isCorrect ? '#d7fbe7' : '#ffe0e0';
  });
}

// Scroll vers le résultat
function scrollToResult() {
  const resultDiv = document.getElementById('result-feedback');
  if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Affichage du résultat
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
  const note20 = Math.round((score / maxScore) * 20 * 100) / 100;
  resultDiv.innerHTML = `
    Ta note : ${score} / ${maxScore} (${note20} / 20)<br>
    <div style="margin:1em 0">${feedback}</div>
    <button id="show-corrections-btn" type="button">Voir les corrections</button>
    <button id="restart-btn" type="button">Recommencer</button>
  `;
  document.getElementById('show-corrections-btn').onclick = showCorrections;
  document.getElementById('restart-btn').onclick = () => window.location.reload();
  scrollToResult();
}

// Validation temps réel
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

// Gestion de la soumission
function handleSubmit(event) {
  event.preventDefault();
  if (!validateForm()) return;
  const { score, maxScore } = calculateScore();
  const feedback = generateFeedback(score, maxScore);
  displayResult(score, maxScore, feedback);
  event.target.querySelector('button[type="submit"]').disabled = true;
}

// Barre de progression
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

// Boutons Vrai/Faux
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

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  document.getElementById('evaluation-form').addEventListener('submit', handleSubmit);
  setupRealtimeValidation();
  setupProgressBar();
  UXmodifs();
  setupVraiFauxButtons();
});
