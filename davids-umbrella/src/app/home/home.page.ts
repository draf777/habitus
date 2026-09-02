import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircleOutline, umbrella, sunny, refresh } from 'ionicons/icons';
import { LocationService } from '../weather/location.service';
import { ForecastService, UmbrellaForecast } from '../weather/forecast.service';
import { AboutComponent } from '../about/about.component';

type ViewState = { status: 'loading' } | { status: 'error' } | { status: 'result'; forecast: UmbrellaForecast };

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner, DecimalPipe],
})
export class HomePage implements OnInit {
  private readonly locationService = inject(LocationService);
  private readonly forecastService = inject(ForecastService);
  private readonly modalController = inject(ModalController);

  readonly state = signal<ViewState>({ status: 'loading' });

  constructor() {
    addIcons({ informationCircleOutline, umbrella, sunny, refresh });
  }

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.state.set({ status: 'loading' });
    try {
      const location = await this.locationService.getLocation();
      const forecast = await this.forecastService.getUmbrellaForecast(location);
      this.state.set({ status: 'result', forecast });
    } catch {
      this.state.set({ status: 'error' });
    }
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({ component: AboutComponent });
    await modal.present();
  }
}
