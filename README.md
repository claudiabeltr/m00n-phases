# m00n-phases

A small desktop widget with a pixel-art twist - built with Electron, it shows tonight's moon phase and the next 7 moons, each with a little Greek and Roman moon lore.

<p align="center">
<img width="256" height="32" alt="moon-phases" src="https://github.com/user-attachments/assets/f972dc41-810e-47e0-ab37-78435ac56b81" />
</p>

## ☾ How to install

1. Download `m00n-phases Setup 1.0.0.exe` below
2. Run the installer and follow the steps
3. Launch m00n-phases from your Start Menu

Windows SmartScreen may show a warning since this app isn't code-signed. Click "More info" → "Run anyway" to proceed — this is expected for small independent apps.

<p align="center">
<img width="601" height="228" alt="image" src="https://github.com/user-attachments/assets/eb2c34a9-ca39-48b7-b070-67ff9c16fbe5" />
</p>

<p align="center">
<img width="600" height="230" alt="image" src="https://github.com/user-attachments/assets/3065ae5b-4ed4-4b7a-b786-019eef761e0c" />
</p>

## ☾ Features

* Shows tonight's moon (one of the 8 phases) with its name, the date, and a short description inspired by Greek and Roman mythology
* Day and night interfaces that switch automatically using your computer's clock, with twinkling stars at night
* "Moons of the week" menu with the next 7 moons, tonight included
* Pixel-art sparkles that follow your cursor
* Animated loading screen when the app opens
* Borderless, resizable window that keeps its proportions
* Needs an internet connection to fetch the moon data, and lets you know when it can't

Get the latest version from the [Releases page](https://github.com/claudiabeltr/m00n-phases/releases)

## ☾ How to Use

* **Moon of the day:** the main screen shows tonight's moon, its date, and its story. During the day it tells you to come back later, since the moon can't be seen yet.
* **Moons of the week:** click the moon button in the top-left corner to open the menu with the next 7 moons. Each one shows its date, phase name, and description.
* **Go back:** click the moon button again to return to the main screen.
* **Read a full description:** in the weekly menu, long descriptions don't always fit. Place the mouse over one and use the mouse wheel to scroll it (there is no visible scrollbar).
* **Minimize:** click the - in the top-right corner.
* **Close:** click the ✕ in the top-right corner.
* **Move the window:** click and drag anywhere on the background.
* **Resize the window:** drag its edges or corners. The proportions stay locked, and there is a minimum size.

<p align="center">
<img width="859" height="326" alt="image" src="https://github.com/user-attachments/assets/8dd56d5f-ee5a-4a8d-b95d-a50ed241c356" />
</p>

## ☾ Good to know

* Night goes from 18:00 to 05:59, and day from 06:00 to 17:59, following your computer's clock. The weekly menu uses the same colors as the screen you opened it from.
* Between 00:00 and 05:59 the app still shows the moon of the night that began the previous evening, so the date shown can be yesterday's.
* If there is no internet connection, the app shows a "No connection" message instead of the moon.
* Moon data is requested for a fixed location, so it may differ slightly from other places around the moment a phase changes.

## ☾ What's next?

* Linux support (AppImage / .deb)
* Choose your own location for the moon data
* Special event moons

## ☾ Credits

Moon data provided by [sunrise-sunset.org](https://sunrise-sunset.org/api).

## ☾ Built with

Electron · HTML · CSS · JavaScript

Found a bug or have an idea? Feel free to open an [issue](https://github.com/claudiabeltr/m00n-phases/issues)
