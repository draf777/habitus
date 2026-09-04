import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
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
} from '@ionic/angular';

import { APP_INFO } from '../../core/app-info';
import { SettingsService } from '../../core/services/settings.service';
import { ColorScheme, Theme } from '../../models/settings.model';

/** "Über" — what the app is, what it is built with, who made it, and the appearance settings. */
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
export class AboutPage {
  readonly info = APP_INFO;
  readonly settings = inject(SettingsService);

  onThemeChange(theme: Theme): void {
    void this.settings.setTheme(theme);
  }

  onColorSchemeChange(colorScheme: ColorScheme): void {
    void this.settings.setColorScheme(colorScheme);
  }
}
