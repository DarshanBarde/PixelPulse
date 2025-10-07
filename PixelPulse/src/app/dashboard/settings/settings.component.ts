import { Component, EventEmitter, Output, type OnInit } from "@angular/core"
import { ThemeService } from "../../services/theme.service"

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  @Output() close = new EventEmitter<void>()

  isDarkMode = false
  userName = "John Doe"
  userEmail = "john.doe@example.com"

  // Settings options
  autoSave = true
  showGrid = true
  enableShadows = true
  antiAliasing = true

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark
    })
  }

  closeSettings(): void {
    this.close.emit()
  }

  toggleTheme(): void {
    this.themeService.toggleTheme()
  }

  saveSettings(): void {
    // Save settings logic
    console.log("Settings saved:", {
      autoSave: this.autoSave,
      showGrid: this.showGrid,
      enableShadows: this.enableShadows,
      antiAliasing: this.antiAliasing,
    })
    this.closeSettings()
  }
}
