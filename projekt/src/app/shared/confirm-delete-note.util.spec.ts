import { AlertController } from '@ionic/angular';

import { confirmDeleteNote } from './confirm-delete-note.util';

describe('confirmDeleteNote', () => {
  function fakeAlertCtrl(role: 'destructive' | 'cancel'): AlertController {
    const create = vi.fn().mockResolvedValue({
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockResolvedValue({ role }),
    });
    return { create } as unknown as AlertController;
  }

  it('resolves true when the user confirms deletion', async () => {
    await expect(confirmDeleteNote(fakeAlertCtrl('destructive'), 'Einkaufsliste')).resolves.toBe(true);
  });

  it('resolves false when the user cancels', async () => {
    await expect(confirmDeleteNote(fakeAlertCtrl('cancel'), 'Einkaufsliste')).resolves.toBe(false);
  });

  it('includes the note title in the confirmation message', async () => {
    const create = vi.fn().mockResolvedValue({
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockResolvedValue({ role: 'cancel' }),
    });
    const alertCtrl = { create } as unknown as AlertController;

    await confirmDeleteNote(alertCtrl, 'Einkaufsliste');

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Einkaufsliste') }));
  });
});
