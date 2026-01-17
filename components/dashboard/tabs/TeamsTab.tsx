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
          <h2 className="font-display text-lg font-semibold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500">Collaborate with your team members</p>
        </div>
        <button
          onClick={onCreateTeam}
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="border border-gray-200 rounded bg-white p-10 text-center">
          <div className="flex items-center justify-center mx-auto mb-4">
            <UsersRound className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="font-display text-sm font-semibold text-gray-900 mb-1">No teams yet</h3>
          <p className="text-sm text-gray-400 mb-5">Create a team to start collaborating with others</p>
          <button
            onClick={onCreateTeam}
            className="bg-gray-900 text-white hover:bg-gray-800 inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Your First Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="border border-gray-200 rounded bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center">
                    <UsersRound className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-xs text-gray-400">{team.members.length} members</p>
                  </div>
                </div>
                <button
                  onClick={() => onInviteMember(team.id)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Invite
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {team.members.map((member) => (
                  <div key={member.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {member.user.image ? (
                        <img
                          src={member.user.image}
                          alt=""
                          className="w-9 h-9 rounded object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name || member.user.email}
                        </p>
                        <p className="text-xs text-gray-400">{member.user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded border ${
                      member.role === 'OWNER' ? 'border-gray-300 text-gray-700' :
                      member.role === 'ADMIN' ? 'border-gray-200 text-gray-600' :
                      'border-gray-200 text-gray-500'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
              {team.invites.filter(i => i.status === 'PENDING').length > 0 && (
                <div className="px-5 py-4 bg-amber-50 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Pending Invites</p>
                  {team.invites.filter(i => i.status === 'PENDING').map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-700">{invite.email}</span>
                      <span className="text-xs text-amber-600">Pending</span>
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
