/** A pickable habit icon: an Ionicons name plus its German label (for a11y / the picker). */
export interface HabitIconOption {
  readonly name: string;
  readonly label: string;
}

/**
 * Curated icon choices for the "Neues Habit" form, covering common habit
 * kinds (fitness, mindfulness, learning, chores, ...). Each is an Ionicons
 * name already bundled with the app — picking one only stores that short
 * string on the habit, no image data.
 */
export const HABIT_ICON_OPTIONS: readonly HabitIconOption[] = [
  { name: 'barbell-outline', label: 'Sport' },
  { name: 'walk-outline', label: 'Spazieren' },
  { name: 'bicycle-outline', label: 'Velofahren' },
  { name: 'body-outline', label: 'Yoga / Dehnen' },
  { name: 'leaf-outline', label: 'Meditation' },
  { name: 'moon-outline', label: 'Schlaf' },
  { name: 'sunny-outline', label: 'Draussen' },
  { name: 'water-outline', label: 'Wasser trinken' },
  { name: 'nutrition-outline', label: 'Ernährung' },
  { name: 'book-outline', label: 'Lesen' },
  { name: 'school-outline', label: 'Lernen' },
  { name: 'bulb-outline', label: 'Deep Work' },
  { name: 'code-slash-outline', label: 'Programmieren' },
  { name: 'create-outline', label: 'Journaling' },
  { name: 'musical-notes-outline', label: 'Musik' },
  { name: 'color-palette-outline', label: 'Kreativität' },
  { name: 'home-outline', label: 'Haushalt' },
  { name: 'cash-outline', label: 'Sparen' },
  { name: 'people-outline', label: 'Familie / Freunde' },
  { name: 'heart-outline', label: 'Achtsamkeit' },
  { name: 'ban-outline', label: 'Verzicht' },
  { name: 'game-controller-outline', label: 'Bildschirmzeit' },
  { name: 'earth-outline', label: 'Sprache lernen' },
  { name: 'trophy-outline', label: 'Ziel' },
  { name: 'ellipse-outline', label: 'Sonstiges' },
];
