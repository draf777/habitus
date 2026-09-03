import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barChartOutline, checkboxOutline, informationCircleOutline, todayOutline } from 'ionicons/icons';

import { TABS } from './tabs.config';

/** The tab bar that hosts the four main pages of the app. */
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  /** The tabs to render, in bar order. */
  readonly tabs = TABS;

  constructor() {
    addIcons({ todayOutline, barChartOutline, checkboxOutline, informationCircleOutline });
  }
}
