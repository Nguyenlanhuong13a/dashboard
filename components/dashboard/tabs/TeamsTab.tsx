'use client'

import { UsersRound, UserPlus, Plus } from 'lucide-react'

interface TeamMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: {
    name: string | null
    email: string
    image: string | null
  }
}

interface TeamInvite {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

interface Team {
  id: string
  name: string
  ownerId: string
  createdAt: string
  members: TeamMember[]
  invites: TeamInvite[]
}

interface TeamsTabProps {
  teams: Team[]
  onCreateTeam: () => void
  onInviteMember: (teamId: string) => void
}

export function TeamsTab({ teams, onCreateTeam, onInviteMember }: TeamsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary-dark">Team Management</h2>
          <p className="text-sm text-primary-dark/60">Collaborate with your team members</p>
        </div>
        <button
          onClick={onCreateTeam}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <UsersRound className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="font-display text-sm font-semibold text-primary-dark mb-1">No teams yet</h3>
          <p className="text-sm text-primary-dark/50 mb-5">Create a team to start collaborating with others</p>
          <button
            onClick={onCreateTeam}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Your First Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center">
                    <UsersRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-primary-dark">{team.name}</h3>
                    <p className="text-xs text-primary-dark/50">{team.members.length} members</p>
                  </div>
                </div>
                <button
                  onClick={() => onInviteMember(team.id)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary border border-primary/30 rounded-xl hover:border-primary transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Invite
                </button>
              </div>
              <div className="divide-y divide-primary/5">
                {team.members.map((member) => (
                  <div key={member.id} className="px-5 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl border border-primary/30 flex items-center justify-center text-sm font-medium text-primary">
                          {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary-dark">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-primary-dark/50">{member.user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-lg border ${
                      member.role === 'OWNER' ? 'border-primary/30 text-primary' :
                      member.role === 'ADMIN' ? 'border-accent/30 text-accent' :
                      'border-primary-dark/20 text-primary-dark/60'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
              {team.invites.filter(i => i.status === 'PENDING').length > 0 && (
                <div className="px-5 py-4 bg-accent-gold/5 border-t border-primary/5">
                  <p className="text-xs text-primary-dark/60 mb-2">Pending Invites</p>
                  {team.invites.filter(i => i.status === 'PENDING').map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-primary-dark/80">{invite.email}</span>
                      <span className="text-xs text-accent-gold">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
