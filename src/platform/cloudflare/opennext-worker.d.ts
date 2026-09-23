/** OpenNextがビルド時に生成する入口の公開契約。 */
declare module "*/.open-next/worker.js" {
  const handler: {
    fetch(request: Request, env: CloudflareEnv, context: ExecutionContext): Promise<Response>
  }
  export default handler
}
