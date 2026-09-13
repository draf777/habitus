import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular';

import { APP_INFO } from '../../core/app-info';
import { AuthService } from '../../core/services/auth.service';
import { DemoDataService } from '../../core/services/demo-data.service';
import { SettingsService } from '../../core/services/settings.service';
import { ColorScheme, Theme } from '../../models/settings.model';

/**
 * "Über" — what the app is, what it is built with, who made it, the
 * appearance settings, and the option to clear the seeded demo data.
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonNote,
    IonSegment,
    IonSegmentButton,
  ],
})
export class AboutPage implements ViewWillEnter {
  private readonly demoData = inject(DemoDataService);
  private readonly alertCtrl = inject(AlertController);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly info = APP_INFO;
  readonly settings = inject(SettingsService);

  /** Whether any of the seeded demo habits/todos still exist. */
  readonly hasDemoData = signal(false);

  constructor() {
    void this.reloadHasDemoData();
  }

  /** Reloads whenever this (cached) page becomes active again, e.g. after demo habits/todos were deleted by hand elsewhere. */
  ionViewWillEnter(): void {
    void this.reloadHasDemoData();
  }

  onThemeChange(theme: Theme): void {
    void this.settings.setTheme(theme);
  }

  onColorSchemeChange(colorScheme: ColorScheme): void {
    void this.settings.setColorScheme(colorScheme);
  }

  /** Asks for confirmation, then deletes the seeded demo habits/todos if the user confirms. */
  async confirmClearDemoData(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Demo-Daten löschen?',
      message: 'Die Beispiel-Habits und -Todos werden endgültig gelöscht. Deine eigenen Daten sind davon nicht betroffen.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive' },
      ],
    });
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role === 'destructive') {
      await this.demoData.clearDemoData();
      await this.reloadHasDemoData();
    }
  }

  private async reloadHasDemoData(): Promise<void> {
    this.hasDemoData.set(await this.demoData.hasDemoData());
  }

  /** Signs the current user out and returns to the login page. */
  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
