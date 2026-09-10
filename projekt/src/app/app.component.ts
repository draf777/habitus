import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

import { DemoDataService } from './core/services/demo-data.service';
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
    void inject(DemoDataService).seedIfNeeded();
    this.watchForAppUpdates();
  }
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
