import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonItem, IonLabel, IonList } from '@ionic/angular';

/**
 * Banner marking a page whose content is still placeholder data.
 *
 * The v0.1.0 pages render the demo constants from `core/data` and none of the
 * controls on them are wired up. This notice says so on the page itself, so the
 * UI does not look like a working feature that is simply broken. It goes away
 * together with the demo data once persistence exists.
 */
@Component({
  selector: 'app-demo-notice',
  templateUrl: './demo-notice.component.html',
  styleUrls: ['./demo-notice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonList, IonItem, IonLabel],
})
export class DemoNoticeComponent {
  /** What exactly does not work yet on the surrounding page. */
  readonly text = input.required<string>();
}
