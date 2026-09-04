import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly swUpdate = inject(SwUpdate);
  private readonly toastCtrl = inject(ToastController);

  constructor() {
    void inject(SettingsService).load();
    this.watchForAppUpdates();
  }

  /**
   * Listens for the service worker announcing that a new version has been
   * downloaded and is ready, and offers to reload to it. Without this, an
   * already-open tab keeps running the old version until it's closed and
   * reopened, even though the new version was fetched in the background.
   */
  private watchForAppUpdates(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }
    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => void this.promptReload());
  }

  private async promptReload(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Eine neue Version von Habitus ist verfügbar.',
      position: 'bottom',
      buttons: [{ text: 'Neu laden', handler: () => document.location.reload() }],
    });
    await toast.present();
  }
}
