import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { informationCircleOutline, umbrella, sunny, refresh } from 'ionicons/icons';
import { LocationService, GeoLocation } from '../weather/location.service';
import { ForecastService, UmbrellaForecast } from '../weather/forecast.service';
import { GeocodingService } from '../weather/geocoding.service';
import { AboutComponent } from '../about/about.component';

type ViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'result'; forecast: UmbrellaForecast; locationLabel: string };

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner, DecimalPipe],
})
export class HomePage implements OnInit {
  private readonly locationService = inject(LocationService);
  private readonly forecastService = inject(ForecastService);
  private readonly geocodingService = inject(GeocodingService);
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
      const [forecast, locationLabel] = await Promise.all([
        this.forecastService.getUmbrellaForecast(location),
        this.resolveLocationLabel(location),
      ]);
      this.state.set({ status: 'result', forecast, locationLabel });
    } catch {
      this.state.set({ status: 'error' });
    }
  }

  // Fallback location is always Zürich (see FALLBACK_LOCATION). For a real device position, look up
  // the place name; if that lookup fails, fall back to showing coordinates instead of nothing.
  private async resolveLocationLabel(location: GeoLocation): Promise<string> {
    if (location.source === 'fallback') {
      return 'Zürich (Standardstandort, kein Standortzugriff)';
    }

    const placeName = await this.geocodingService.resolvePlaceName(location);
    if (placeName) {
      return placeName;
    }

    const ns = location.lat >= 0 ? 'N' : 'S';
    const ew = location.lon >= 0 ? 'O' : 'W';
    return `Aktueller Standort (${Math.abs(location.lat).toFixed(2)}°${ns}, ${Math.abs(location.lon).toFixed(2)}°${ew})`;
  }

  async openAbout(): Promise<void> {
    const modal = await this.modalController.create({ component: AboutComponent });
    await modal.present();
  }
}
