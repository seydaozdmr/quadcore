import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TeamService } from '../../core/services/team.service';
import { Team } from '../../core/models/retro.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf, DatePipe],
  template: `
    <div class="home">
      <section class="hero">
        <h1>RetroAction <span class="accent">AI</span></h1>
        <p class="subtitle">
          Yapay zeka destekli Agile retrospektif platformu.
          Takımınızın geri bildirimlerini akıllıca analiz edin.
        </p>
      </section>

      <!-- Create Team -->
      <section class="create-team card">
        <h2 class="section-title">Yeni Takım Oluştur</h2>
        <div class="create-form">
          <input
            class="input"
            [(ngModel)]="newTeamName"
            placeholder="Takım adı girin..."
            (keyup.enter)="createTeam()"
          />
          <button
            class="btn btn-primary"
            [disabled]="!newTeamName().trim()"
            (click)="createTeam()"
          >
            + Takım Oluştur
          </button>
        </div>
      </section>

      <!-- Team List -->
      <section class="teams-section">
        <h2 class="section-title">Takımlarınız</h2>

        <div *ngIf="loading()" class="empty-state">
          <p class="pulse">Yükleniyor...</p>
        </div>

        <div *ngIf="!loading() && teams().length === 0" class="empty-state">
          <div class="empty-icon">&#128101;</div>
          <p>Henüz bir takım oluşturmadınız.</p>
        </div>

        <div class="team-grid">
          <a
            *ngFor="let team of teams()"
            [routerLink]="['/teams', team.id]"
            class="card card-hover team-card fade-in"
          >
            <div class="team-card-header">
              <span class="team-avatar">{{ team.name.charAt(0).toUpperCase() }}</span>
              <div>
                <h3 class="team-name">{{ team.name }}</h3>
                <span class="team-meta">{{ team.memberCount || 0 }} üye</span>
              </div>
            </div>
            <div class="team-card-footer">
              <span class="team-date">{{ team.createdAt | date:'dd MMM yyyy' }}</span>
              <span class="team-arrow">&rarr;</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      padding: 40px 0 32px;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        letter-spacing: -1px;
        margin-bottom: 8px;
      }

      .accent {
        color: var(--accent);
      }

      .subtitle {
        color: var(--text-secondary);
        font-size: 1.05rem;
        max-width: 480px;
        margin: 0 auto;
      }
    }

    .create-team {
      margin-bottom: 32px;
    }

    .create-form {
      display: flex;
      gap: 12px;

      .input {
        flex: 1;
      }
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .team-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      text-decoration: none;
      color: var(--text-primary);
    }

    .team-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .team-avatar {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      background: var(--accent-light);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .team-name {
      font-size: 1.05rem;
      font-weight: 600;
    }

    .team-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .team-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .team-arrow {
      font-size: 1.1rem;
      color: var(--accent);
    }

    @media (max-width: 600px) {
      .create-form {
        flex-direction: column;
      }

      .hero h1 {
        font-size: 2rem;
      }
    }
  `],
})
export class HomeComponent implements OnInit {
  private readonly teamService = inject(TeamService);

  readonly teams = signal<Team[]>([]);
  readonly loading = signal(true);
  readonly newTeamName = signal('');

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading.set(true);
    this.teamService.getAll().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  createTeam(): void {
    const name = this.newTeamName().trim();
    if (!name) return;

    this.teamService.create({ name }).subscribe({
      next: (team) => {
        this.teams.update(list => [...list, team]);
        this.newTeamName.set('');
      },
    });
  }
}
