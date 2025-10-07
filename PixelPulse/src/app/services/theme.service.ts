import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false)
  public darkMode$ = this.darkModeSubject.asObservable()

  constructor() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    this.setDarkMode(isDark)
  }

  toggleTheme(): void {
    this.setDarkMode(!this.darkModeSubject.value)
  }

  setDarkMode(isDark: boolean): void {
    this.darkModeSubject.next(isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")

    if (isDark) {
      document.documentElement.classList.add("dark-theme")
    } else {
      document.documentElement.classList.remove("dark-theme")
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value
  }
}
