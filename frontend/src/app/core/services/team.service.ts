import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, CreateTeamRequest } from '../models/retro.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/teams';

  getAll(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseUrl);
  }

  getById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
