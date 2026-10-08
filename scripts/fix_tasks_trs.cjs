const fs = require('fs');

let code = fs.readFileSync('app-tasks.js', 'utf8');

const map = [
  {
    target: "tr({ de: 'Keine erledigten Aufgaben zum Aufräumen gefunden ℹ️', en: 'No completed tasks found to clear ℹ️' })",
    repl: "tr({ de: 'Keine erledigten Aufgaben zum Aufräumen gefunden ℹ️', en: 'No completed tasks found to clear ℹ️', fr: 'Aucune tâche terminée trouvée à nettoyer ℹ️', it: 'Nessuna attività completata trovata da eliminare ℹ️', es: 'No se encontraron tareas completadas para limpiar ℹ️', el: 'Δεν βρέθηκαν ολοκληρωμένες εργασίες για εκκαθάριση ℹ️' })"
  },
  {
    target: "tr({ de: 'Arbeitsbereich: Privat 🏠', en: 'Workspace: Personal 🏠' })",
    repl: "tr({ de: 'Arbeitsbereich: Privat 🏠', en: 'Workspace: Personal 🏠', fr: 'Espace : Personnel 🏠', it: 'Spazio: Personale 🏠', es: 'Espacio: Personal 🏠', el: 'Χώρος: Προσωπικός 🏠' })"
  },
  {
    target: "tr({ de: 'Arbeitsbereich: Studium 🎓', en: 'Workspace: Study 🎓' })",
    repl: "tr({ de: 'Arbeitsbereich: Studium 🎓', en: 'Workspace: Study 🎓', fr: 'Espace : Études 🎓', it: 'Spazio: Studio 🎓', es: 'Espacio: Estudio 🎓', el: 'Χώρος: Σπουδές 🎓' })"
  },
  {
    target: "tr({ de: 'Arbeitsbereich: Arbeit 💼', en: 'Workspace: Work 💼' })",
    repl: "tr({ de: 'Arbeitsbereich: Arbeit 💼', en: 'Workspace: Work 💼', fr: 'Espace : Travail 💼', it: 'Spazio: Lavoro 💼', es: 'Espacio: Trabajo 💼', el: 'Χώρος: Εργασία 💼' })"
  },
  {
    target: "tr({ de: 'Neue Karte hinzufügen', en: 'Add new card' })",
    repl: "tr({ de: 'Neue Karte hinzufügen', en: 'Add new card', fr: 'Ajouter une nouvelle carte', it: 'Aggiungi nuova scheda', es: 'Añadir nueva tarjeta', el: 'Προσθήκη νέας κάρτας' })"
  },
  {
    target: "tr({ de: 'Name der Karte...', en: 'Card name...' })",
    repl: "tr({ de: 'Name der Karte...', en: 'Card name...', fr: 'Nom de la carte...', it: 'Nome della scheda...', es: 'Nombre de la tarjeta...', el: 'Όνομα κάρτας...' })"
  },
  {
    target: "tr({ de: 'Aktiv', en: 'Active' })",
    repl: "tr({ de: 'Aktiv', en: 'Active', fr: 'Actif', it: 'Attivo', es: 'Activo', el: 'Ενεργό' })"
  },
  {
    target: "tr({ de: 'Ausgeblendet', en: 'Hidden' })",
    repl: "tr({ de: 'Ausgeblendet', en: 'Hidden', fr: 'Masqué', it: 'Nascosto', es: 'Oculto', el: 'Κρυφό' })"
  },
  {
    target: "tr({ de: 'Löschen', en: 'Delete' })",
    repl: "tr({ de: 'Löschen', en: 'Delete', fr: 'Supprimer', it: 'Elimina', es: 'Eliminar', el: 'Διαγραφή' })"
  },
  {
    target: "tr({ de: 'Standard', en: 'Default' })",
    repl: "tr({ de: 'Standard', en: 'Default', fr: 'Défaut', it: 'Predefinito', es: 'Predeterminado', el: 'Προεπιλογή' })"
  },
  {
    target: "tr({ de: 'Alle Aufgaben in den Karten leeren', en: 'Clear all tasks in cards' })",
    repl: "tr({ de: 'Alle Aufgaben in den Karten leeren', en: 'Clear all tasks in cards', fr: 'Vider toutes les tâches dans les cartes', it: 'Svuota tutte le attività nelle schede', es: 'Vaciar todas las tareas en las tarjetas', el: 'Εκκαθάριση όλων των εργασιών στις κάρτες' })"
  },
  {
    target: "tr({ de: 'Karten leeren', en: 'Clear cards' })",
    repl: "tr({ de: 'Karten leeren', en: 'Clear cards', fr: 'Vider les cartes', it: 'Svuota schede', es: 'Vaciar tarjetas', el: 'Εκκαθάριση καρτών' })"
  },
  {
    target: "tr({ de: 'Fertig', en: 'Done' })",
    repl: "tr({ de: 'Fertig', en: 'Done', fr: 'Terminé', it: 'Fatto', es: 'Listo', el: 'Τέλος' })"
  },
  {
    target: "tr({ de: 'Neue Karte anlegen', en: 'Create New Card' })",
    repl: "tr({ de: 'Neue Karte anlegen', en: 'Create New Card', fr: 'Créer une nouvelle carte', it: 'Crea nuova scheda', es: 'Crear nueva tarjeta', el: 'Δημιουργία νέας κάρτας' })"
  },
  {
    target: "tr({ de: 'Name der neuen Karte...', en: 'New card name...' })",
    repl: "tr({ de: 'Name der neuen Karte...', en: 'New card name...', fr: 'Nom de la nouvelle carte...', it: 'Nome della nuova scheda...', es: 'Nombre de la nueva tarjeta...', el: 'Όνομα νέας κάρτας...' })"
  },
  {
    target: "tr({ de: 'Hinzufügen', en: 'Add' })",
    repl: "tr({ de: 'Hinzufügen', en: 'Add', fr: 'Ajouter', it: 'Aggiungi', es: 'Añadir', el: 'Προσθήκη' })"
  },
  {
    target: "tr({ de: 'Aufgaben', en: 'tasks' })",
    repl: "tr({ de: 'Aufgaben', en: 'tasks', fr: 'tâches', it: 'attività', es: 'tareas', el: 'εργασίες' })"
  },
  {
    target: "tr({ de: 'Aktiv ✓', en: 'Active ✓' })",
    repl: "tr({ de: 'Aktiv ✓', en: 'Active ✓', fr: 'Actif ✓', it: 'Attivo ✓', es: 'Activo ✓', el: 'Ενεργό ✓' })"
  },
  {
    target: "tr({ de: 'Karte löschen', en: 'Delete card' })",
    repl: "tr({ de: 'Karte löschen', en: 'Delete card', fr: 'Supprimer la carte', it: 'Elimina scheda', es: 'Eliminar tarjeta', el: 'Διαγραφή κάρτας' })"
  },
  {
    target: "tr({ de: 'Standard wiederherstellen', en: 'Reset to default' })",
    repl: "tr({ de: 'Standard wiederherstellen', en: 'Reset to default', fr: 'Rétablir par défaut', it: 'Ripristina predefiniti', es: 'Restablecer predeterminado', el: 'Επαναφορά προεπιλογών' })"
  },
  {
    target: "tr({ de: 'Mindestens eine Spalte muss auf dem Board bleiben!', en: 'At least one column must stay on the board!' })",
    repl: "tr({ de: 'Mindestens eine Spalte muss auf dem Board bleiben!', en: 'At least one column must stay on the board!', fr: 'Au moins une colonne doit rester sur le tableau !', it: 'Almeno una colonna deve rimanere sulla lavagna!', es: '¡Al menos una columna debe permanecer en el tablero!', el: 'Τουλάχιστον μία στήλη πρέπει να παραμείνει στον πίνακα!' })"
  },
  {
    target: "tr({ de: 'Karte entfernen?', en: 'Remove card?' })",
    repl: "tr({ de: 'Karte entfernen?', en: 'Remove card?', fr: 'Supprimer la carte ?', it: 'Rimuovere la scheda?', es: '¿Eliminar tarjeta?', el: 'Αφαίρεση κάρτας;' })"
  },
  {
    target: "tr({ de: 'Entfernen', en: 'Remove' })",
    repl: "tr({ de: 'Entfernen', en: 'Remove', fr: 'Supprimer', it: 'Rimuovi', es: 'Eliminar', el: 'Αφαίρεση' })"
  },
  {
    target: "tr({ de: 'Karten-Aktionen & Aufräumen', en: 'Column actions & clear' })",
    repl: "tr({ de: 'Karten-Aktionen & Aufräumen', en: 'Column actions & clear', fr: 'Actions de carte & nettoyage', it: 'Azioni scheda e pulizia', es: 'Acciones de tarjetas y limpieza', el: 'Ενέργειες καρτών & εκκαθάριση' })"
  },
  {
    target: "tr({ de: 'Karten-Aktionen & Aufräumen (Leeren, Archivieren, Löschen) ⚙️', en: 'Column actions & clear ⚙️' })",
    repl: "tr({ de: 'Karten-Aktionen & Aufräumen (Leeren, Archivieren, Löschen) ⚙️', en: 'Column actions & clear ⚙️', fr: 'Actions de carte & nettoyage (Vider, Archiver, Supprimer) ⚙️', it: 'Azioni scheda e pulizia (Svuota, Archivia, Elimina) ⚙️', es: 'Acciones de tarjetas y limpieza (Vaciar, Archivar, Eliminar) ⚙️', el: 'Ενέργειες καρτών & εκκαθάριση (Εκκαθάριση, Αρχειοθέτηση, Διαγραφή) ⚙️' })"
  },
  {
    target: "tr({ de: 'Neue Notiz tippen (Enter zum Speichern)...', en: 'Type new note (Enter to save)...' })",
    repl: "tr({ de: 'Neue Notiz tippen (Enter zum Speichern)...', en: 'Type new note (Enter to save)...', fr: 'Écrire une note (Entrée pour enregistrer)...', it: 'Scrivi nuova nota (Invio per salvare)...', es: 'Escribir nota (Enter para guardar)...', el: 'Πληκτρολογήστε νέα σημείωση (Enter για αποθήκευση)...' })"
  },
  {
    target: "tr({ de: 'Termin-Status ändern', en: 'Change appointment status' })",
    repl: "tr({ de: 'Termin-Status ändern', en: 'Change appointment status', fr: 'Changer le statut du rendez-vous', it: 'Modifica stato appuntamento', es: 'Cambiar estado de la cita', el: 'Αλλαγή κατάστασης ραντεβού' })"
  },
  {
    target: "tr({ de: 'Status durchschalten: Stattgefunden / Nicht stattgefunden / Offen', en: 'Toggle status: Attended / Did not happen / Open' })",
    repl: "tr({ de: 'Status durchschalten: Stattgefunden / Nicht stattgefunden / Offen', en: 'Toggle status: Attended / Did not happen / Open', fr: 'Basculer statut : Eu lieu / Pas eu lieu / Ouvert', it: 'Cambia stato: Avvenuto / Non avvenuto / Aperto', es: 'Cambiar estado: Asistido / No asistido / Abierto', el: 'Εναλλαγή κατάστασης: Πραγματοποιήθηκε / Δεν πραγματοποιήθηκε / Ανοιχτό' })"
  },
  {
    target: "tr({ de: 'Stattgefunden', en: 'Attended' })",
    repl: "tr({ de: 'Stattgefunden', en: 'Attended', fr: 'Eu lieu', it: 'Avvenuto', es: 'Asistido', el: 'Πραγματοποιήθηκε' })"
  },
  {
    target: "tr({ de: 'Stattgefunden ✅', en: 'Attended ✅' })",
    repl: "tr({ de: 'Stattgefunden ✅', en: 'Attended ✅', fr: 'Eu lieu ✅', it: 'Avvenuto ✅', es: 'Asistido ✅', el: 'Πραγματοποιήθηκε ✅' })"
  },
  {
    target: "tr({ de: 'Nicht stattgefunden', en: 'Did not happen' })",
    repl: "tr({ de: 'Nicht stattgefunden', en: 'Did not happen', fr: 'Pas eu lieu', it: 'Non avvenuto', es: 'No asistido', el: 'Δεν πραγματοποιήθηκε' })"
  },
  {
    target: "tr({ de: 'Nicht stattgefunden ❌', en: 'Did not happen ❌' })",
    repl: "tr({ de: 'Nicht stattgefunden ❌', en: 'Did not happen ❌', fr: 'Pas eu lieu ❌', it: 'Non avvenuto ❌', es: 'No asistido ❌', el: 'Δεν πραγματοποιήθηκε ❌' })"
  },
  {
    target: "tr({ de: 'Verschieben', en: 'Postpone' })",
    repl: "tr({ de: 'Verschieben', en: 'Postpone', fr: 'Reporter', it: 'Posticipa', es: 'Posponer', el: 'Αναβολή' })"
  },
  {
    target: "tr({ de: 'Verschieben & als verschoben markieren 🔄', en: 'Postpone & mark 🔄' })",
    repl: "tr({ de: 'Verschieben & als verschoben markieren 🔄', en: 'Postpone & mark 🔄', fr: 'Reporter & marquer 🔄', it: 'Posticipa e contrassegna 🔄', es: 'Posponer y marcar 🔄', el: 'Αναβολή & επισήμανση 🔄' })"
  },
  {
    target: "tr({ de: 'Offen', en: 'Open' })",
    repl: "tr({ de: 'Offen', en: 'Open', fr: 'Ouvert', it: 'Aperto', es: 'Abierto', el: 'Ανοιχτό' })"
  },
  {
    target: "tr({ de: 'Verschoben', en: 'Postponed' })",
    repl: "tr({ de: 'Verschoben', en: 'Postponed', fr: 'Reporté', it: 'Posticipato', es: 'Pospuesto', el: 'Αναβλήθηκε' })"
  },
  {
    target: "tr({ de: 'Aufgabe hinzufügen (Enter)', en: 'Add task (Enter)' })",
    repl: "tr({ de: 'Aufgabe hinzufügen (Enter)', en: 'Add task (Enter)', fr: 'Ajouter une tâche (Entrée)', it: 'Aggiungi attività (Invio)', es: 'Añadir tarea (Enter)', el: 'Προσθήκη εργασίας (Enter)' })"
  },
  {
    target: "tr({ de: '💡 Aufgaben-Vorschläge & Inspiration', en: '💡 Task Suggestions & Inspiration' })",
    repl: "tr({ de: '💡 Aufgaben-Vorschläge & Inspiration', en: '💡 Task Suggestions & Inspiration', fr: '💡 Suggestions de tâches & Inspiration', it: '💡 Suggerimenti per le attività & Ispirazione', es: '💡 Sugerencias de tareas e inspiración', el: '💡 Προτάσεις εργασιών & Έμπνευση' })"
  },
  {
    target: "tr({ de: 'Notiz gespeichert! 📝', en: 'Note saved! 📝' })",
    repl: "tr({ de: 'Notiz gespeichert! 📝', en: 'Note saved! 📝', fr: 'Note enregistrée ! 📝', it: 'Nota salvata! 📝', es: '¡Nota guardada! 📝', el: 'Η σημείωση αποθηκεύτηκε! 📝' })"
  },
  {
    target: "tr({ de: 'Notiz in Zwischenablage kopiert! 📋', en: 'Note copied to clipboard! 📋' })",
    repl: "tr({ de: 'Notiz in Zwischenablage kopiert! 📋', en: 'Note copied to clipboard! 📋', fr: 'Note copiée dans le presse-papiers ! 📋', it: 'Nota copiata negli appunti! 📋', es: '¡Nota copiada al portapapeles! 📋', el: 'Η σημείωση αντιγράφηκε στο πρόχειρο! 📋' })"
  },
  {
    target: "tr({ de: 'Bitte ein gültiges Datum wählen!', en: 'Please select a valid date!' })",
    repl: "tr({ de: 'Bitte ein gültiges Datum wählen!', en: 'Please select a valid date!', fr: 'Veuillez sélectionner une date valide !', it: 'Seleziona una data valida!', es: '¡Seleccione una fecha válida!', el: 'Παρακαλούμε επιλέξτε έγκυρη ημερομηνία!' })"
  }
];

map.forEach(item => {
  code = code.split(item.target).join(item.repl);
});

fs.writeFileSync('app-tasks.js', code, 'utf8');
console.log('Finished updating app-tasks.js');
