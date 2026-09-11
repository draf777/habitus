import { AlertController } from '@ionic/angular';

/**
 * Shows the "Notiz löschen?" confirmation alert and resolves whether the
 * user confirmed. Shared between `NotesPage` (deleting from the list) and
 * `NoteEditorComponent` (deleting from within the sheet) — the alert itself
 * is identical, only what happens afterwards differs.
 */
export async function confirmDeleteNote(alertCtrl: AlertController, title: string): Promise<boolean> {
  const alert = await alertCtrl.create({
    header: 'Notiz löschen?',
    message: `„${title}“ wird endgültig gelöscht.`,
    buttons: [
      { text: 'Abbrechen', role: 'cancel' },
      { text: 'Löschen', role: 'destructive' },
    ],
  });
  await alert.present();

  const { role } = await alert.onDidDismiss();
  return role === 'destructive';
}
