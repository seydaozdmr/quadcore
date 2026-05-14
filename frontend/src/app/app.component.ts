import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass],
  template: `
    <div class="app-shell" [ngClass]="{ 'dark-theme': isDark() }">
      <header class="app-header">
        <a routerLink="/" class="logo">
          <span class="logo-icon">&#9670;</span>
          <span class="logo-text">RetroAction <strong>AI</strong></span>
        </a>
        <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="isDark() ? 'Aydınlık tema' : 'Karanlık tema'">
          {{ isDark() ? '☀️' : '🌙' }}
        </button>
      </header>
      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: var(--bg-primary);
      color: var(--text-primary);
      transition: background 0.3s, color 0.3s;
    }

    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 60px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 1.25rem;
    }

    .logo-icon {
      color: var(--accent);
      font-size: 1.5rem;
    }

    .logo-text {
      font-weight: 400;
      letter-spacing: -0.5px;
    }

    .logo-text strong {
      color: var(--accent);
    }

    .theme-toggle {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background 0.2s;
    }

    .theme-toggle:hover {
      background: var(--bg-hover);
    }

    .app-main {
      flex: 1;
      padding: 24px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    @media (max-width: 768px) {
      .app-main {
        padding: 16px;
      }
    }
  `],
})
export class AppComponent {
  readonly isDark = signal(false);

  constructor() {
    const saved = localStorage.getItem('retroaction-theme');
    if (saved === 'dark') {
      this.isDark.set(true);
      document.documentElement.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    const dark = this.isDark();
    localStorage.setItem('retroaction-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-theme', dark);
  }
}
