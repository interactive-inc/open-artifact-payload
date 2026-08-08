import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    DELETE FROM payload_locked_documents
    WHERE NOT EXISTS (
      SELECT 1
      FROM payload_locked_documents_rels AS rels
      WHERE rels.parent_id = payload_locked_documents.id
        AND rels.path = 'user'
        AND rels.users_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM users
          WHERE users.id = rels.users_id
        )
    );
  `)
}

// データ整合性の修復なので、down で孤立ロックを復元しない。
export async function down(_args: MigrateDownArgs): Promise<void> {}
