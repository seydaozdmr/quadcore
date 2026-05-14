import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { TeamService } from '../../core/services/team.service';
import { RetroService } from '../../core/services/retro.service';
import { Team, RetroSession } from '../../core/models/retro.model';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe, NgClass],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <a routerLink="/" class="back-link">&larr; Takımlar</a>
        <div *ngIf="team()" class="team-info">
          <h1>{{ team()!.name }}</h1>
          <span class="member-count">{{ team()!.memberCount || 0 }} üye</span>
        </div>
        <button class="btn btn-primary" (click)="createRetro()">
          + Yeni Retro Başlat
        </button>
      </div>

      <!-- Retro History -->
      <section class="retro-list">
        <h2 class="section-title">Retro Geçmişi</h2>

        <div *ngIf="loading()" class="empty-state">
          <p class="pulse">Yükleniyor...</p>
        </div>

        <div *ngIf="!loading() && retros().length === 0" class="empty-state">
          <div class="empty-icon">&#128203;</div>
          <p>Henüz bir retrospektif yapılmamış. Yeni bir retro başlatın!</p>
        </div>

        <div class="retro-grid">
          <a
            *ngFor="let retro of retros()"
            [routerLink]="['/retro', retro.roomCode]"
            class="card card-hover retro-card fade-in"
          >
            <div class="retro-card-top">
              <span class="room-code">{{ retro.roomCode }}</span>
              <span
                class="phase-badge"
                [ngClass]="'phase-' + retro.status.toLowerCase()"
              >
                {{ getPhaseLabel(retro.status) }}
              </span>
            </div>
            <div class="retro-card-date">
              {{ retro.createdAt | date:'dd MMM yyyy, HH:mm' }}
            </div>
            <div class="retro-card-footer">
              <span *ngIf="retro.closedAt" class="closed-label">Tamamlandı</span>
              <span *ngIf="!retro.closedAt" class="active-label">Aktif</span>
              <span class="retro-arrow">&rarr;</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 900px;
      margin: 0 auto;
    }

    .back-link {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;

      &:hover {
        color: var(--accent);
      }
    }

    .dashboard-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
      }

      .member-count {
        font-size: 0.875rem;
        color: var(--text-muted);
      }

      .btn {
        align-self: flex-start;
      }
    }

    .retro-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .retro-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-decoration: none;
      color: var(--text-primary);
    }

    .retro-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .room-code {
      font-family: monospace;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
    }

    .phase-badge {
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .phase-collect {
      background: var(--accent-light);
      color: var(--accent);
    }

    .phase-vote {
      background: var(--improve-bg);
      color: var(--improve);
    }

    .phase-action {
      background: var(--action-bg);
      color: var(--action);
    }

    .phase-summary {
      background: var(--went-well-bg);
      color: var(--went-well);
    }

    .retro-card-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .retro-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    .active-label {
      color: var(--went-well);
      font-weight: 600;
    }

    .closed-label {
      color: var(--text-muted);
    }

    .retro-arrow {
      color: var(--accent);
      font-size: 1.1rem;
    }
  `],
})
export class TeamDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  private readonly retroService = inject(RetroService);

  readonly team = signal<Team | null>(null);
  readonly retros = signal<RetroSession[]>([]);
  readonly loading = signal(true);

  private teamId = '';

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadData();
  }

  loadData(): void {
    this.teamService.getById(this.teamId).subscribe({
      next: (team) => this.team.set(team),
    });

    this.retroService.getByTeamId(this.teamId).subscribe({
      next: (retros) => {
        this.retros.set(retros);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  createRetro(): void {
    this.retroService.create({ teamId: this.teamId }).subscribe({
      next: (retro) => {
        this.router.navigate(['/retro', retro.roomCode]);
      },
    });
  }

  getPhaseLabel(status: string): string {
    const labels: Record<string, string> = {
      COLLECT: 'Toplama',
      VOTE: 'Oylama',
      ACTION: 'Aksiyon',
      SUMMARY: 'Özet',
    };
    return labels[status] ?? status;
  }
}
