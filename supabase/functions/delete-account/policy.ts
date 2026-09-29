export const DELETED_USER_PLACEHOLDER = '00000000-0000-0000-0000-000000000001'

export type UserFkAction = 'placeholder' | 'null' | 'database-set-null'

export type UserFkPolicy = {
  table: string
  column: string
  onDelete: 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL'
  nullable: boolean
  preserveRow: boolean
  action: UserFkAction
  scrub?: Record<string, string | null>
}

// Every public.users FK in migrations 001-029. Rows that must survive account
// deletion are kept. Nullable actor stamps with ON DELETE SET NULL stay on
// the database path. NOT NULL or CASCADE/RESTRICT links are rewritten first.
export const userFkPolicy: UserFkPolicy[] = [
  { table: 'projects', column: 'user_id', onDelete: 'CASCADE', nullable: false, preserveRow: true, action: 'placeholder', scrub: { input_data: null } },
  { table: 'orders', column: 'user_id', onDelete: 'NO ACTION', nullable: false, preserveRow: true, action: 'placeholder' },
  { table: 'inquiries', column: 'user_id', onDelete: 'CASCADE', nullable: true, preserveRow: true, action: 'placeholder', scrub: { name: null, email: null, phone: null, ip: null } },
  { table: 'policy_agreements', column: 'user_id', onDelete: 'CASCADE', nullable: false, preserveRow: true, action: 'placeholder' },
  { table: 'refund_requests', column: 'user_id', onDelete: 'RESTRICT', nullable: false, preserveRow: true, action: 'placeholder' },
  { table: 'refund_requests', column: 'reviewed_by', onDelete: 'NO ACTION', nullable: true, preserveRow: true, action: 'null' },
  { table: 'leads', column: 'user_id', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null', scrub: { name: 'deleted', email: 'deleted@seoah.studio', phone: null, company: null } },
  { table: 'proposals', column: 'user_id', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
  { table: 'proposal_internal_notes', column: 'created_by', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
  { table: 'contracts', column: 'user_id', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
  { table: 'contract_agreements', column: 'agreed_by', onDelete: 'RESTRICT', nullable: false, preserveRow: true, action: 'placeholder', scrub: { agreed_ip: null } },
  { table: 'engagements', column: 'user_id', onDelete: 'RESTRICT', nullable: false, preserveRow: true, action: 'placeholder' },
  { table: 'engagement_files', column: 'uploaded_by', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
  { table: 'engagement_messages', column: 'sender_user_id', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
  { table: 'engagement_activities', column: 'actor_user_id', onDelete: 'SET NULL', nullable: true, preserveRow: true, action: 'database-set-null' },
]

export type DeletionStep = {
  table: string
  matchColumn: string
  values: Record<string, string | null>
}

function assertIdent(value: string) {
  if (!/^[a-z_]+$/.test(value)) throw new Error('unexpected identifier')
}

export function deletionSteps(): DeletionStep[] {
  const steps: DeletionStep[] = []
  for (const fk of userFkPolicy) {
    const values: Record<string, string | null> = { ...(fk.scrub ?? {}) }
    if (fk.action === 'placeholder') values[fk.column] = DELETED_USER_PLACEHOLDER
    if (fk.action === 'null') values[fk.column] = null
    if (Object.keys(values).length === 0) continue
    steps.push({ table: fk.table, matchColumn: fk.column, values })
  }
  return steps
}

export function deletionSql(userId: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('bad user id')
  return deletionSteps().map((step) => {
    assertIdent(step.table)
    assertIdent(step.matchColumn)
    const sets = Object.entries(step.values).map(([column, value]) => {
      assertIdent(column)
      if (value === null) return `${column} = NULL`
      if (value === DELETED_USER_PLACEHOLDER || value === 'deleted' || value === 'deleted@seoah.studio') {
        return `${column} = '${value}'`
      }
      throw new Error('unexpected deletion value')
    })
    return `UPDATE public.${step.table} SET ${sets.join(', ')} WHERE ${step.matchColumn} = '${userId}';`
  }).join('\n')
}
