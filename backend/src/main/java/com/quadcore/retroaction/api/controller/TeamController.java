package com.quadcore.retroaction.api.controller;

import com.quadcore.retroaction.application.dto.Dtos.CreateTeamRequest;
import com.quadcore.retroaction.application.dto.Dtos.TeamResponse;
import com.quadcore.retroaction.domain.model.Team;
import com.quadcore.retroaction.domain.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamResponse createTeam(@RequestBody CreateTeamRequest request) {
        Team team = teamService.createTeam(request.name());
        return toResponse(team);
    }

    @GetMapping
    public List<TeamResponse> getAllTeams() {
        return teamService.getAllTeams().stream()
                .map(TeamController::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public TeamResponse getTeam(@PathVariable Long id) {
        Team team = teamService.getTeam(id);
        return toResponse(team);
    }

    private static TeamResponse toResponse(Team team) {
        return new TeamResponse(team.getId(), team.getName(), team.getCreatedAt());
    }
}
