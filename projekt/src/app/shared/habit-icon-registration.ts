import { addIcons } from 'ionicons';
import {
  banOutline,
  barbellOutline,
  bicycleOutline,
  bodyOutline,
  bookOutline,
  bulbOutline,
  cashOutline,
  codeSlashOutline,
  colorPaletteOutline,
  createOutline,
  earthOutline,
  ellipseOutline,
  gameControllerOutline,
  heartOutline,
  homeOutline,
  leafOutline,
  moonOutline,
  musicalNotesOutline,
  nutritionOutline,
  peopleOutline,
  schoolOutline,
  sunnyOutline,
  trophyOutline,
  walkOutline,
  waterOutline,
} from 'ionicons/icons';

let registered = false;

/**
 * Registers every icon in `HABIT_ICON_OPTIONS` with `ionicons`, so `<ion-icon
 * name="...">` renders them from the bundle instead of fetching over the
 * network (the app is meant to work fully offline). Safe to call repeatedly
 * — every component that renders a habit's icon calls this once.
 */
export function registerHabitIcons(): void {
  if (registered) {
    return;
  }
  registered = true;
  addIcons({
    banOutline,
    barbellOutline,
    bicycleOutline,
    bodyOutline,
    bookOutline,
    bulbOutline,
    cashOutline,
    codeSlashOutline,
    colorPaletteOutline,
    createOutline,
    earthOutline,
    ellipseOutline,
    gameControllerOutline,
    heartOutline,
    homeOutline,
    leafOutline,
    moonOutline,
    musicalNotesOutline,
    nutritionOutline,
    peopleOutline,
    schoolOutline,
    sunnyOutline,
    trophyOutline,
    walkOutline,
    waterOutline,
  });
}
