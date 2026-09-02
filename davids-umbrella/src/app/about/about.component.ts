import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-about',
  templateUrl: 'about.component.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
})
export class AboutComponent {
  private readonly modalController = inject(ModalController);

  constructor() {
    addIcons({ close });
  }

  dismiss(): void {
    this.modalController.dismiss();
  }
}
