import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'teams/:id',
    loadComponent: () =>
      import('./features/team-dashboard/team-dashboard.component').then(
        m => m.TeamDashboardComponent
      ),
  },
  {
    path: 'retro/:roomCode',
    loadComponent: () =>
      import('./features/retro-room/retro-room.component').then(
        m => m.RetroRoomComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
