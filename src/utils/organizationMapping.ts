export interface OrganizationDropTeam {
  title: string;
  leader: string;
  matchTeams: string[];
}

export function buildOrganizationDropPayload(division: string, team: OrganizationDropTeam) {
  return {
    division,
    team: team.matchTeams[0] ?? team.title,
    leader: team.leader,
  };
}
