import type { useDocumentInfo, useForm } from "@payloadcms/ui"

type Props = {
  form: ReturnType<typeof useForm>
  document: ReturnType<typeof useDocumentInfo>
  apiRoute: string
  locale: string
  mode: "draft" | "publish" | "save"
}

/** Submit through Payload's form so validation, hooks, locks and visible errors remain intact. */
export async function saveWebMcpDocument(props: Props) {
  const document = props.document
  const hasDrafts = Boolean(document.docConfig?.versions && document.docConfig.versions.drafts)

  if (props.mode === "save" && hasDrafts)
    return { ok: false, error: "Choose draft or publish for this document" }
  if (props.mode !== "save" && !hasDrafts)
    return { ok: false, error: "This document uses save, not draft/publish" }
  if (props.mode === "publish" && !document.hasPublishPermission)
    return { ok: false, error: "Publishing is not permitted" }

  const route = document.collectionSlug
    ? `${document.collectionSlug}${document.id ? `/${document.id}` : ""}`
    : `globals/${document.globalSlug}`
  const query = new URLSearchParams({
    locale: props.locale,
    depth: "0",
    "fallback-locale": "null",
    draft: String(props.mode === "draft"),
  })
  const submission = await props.form.submit({
    action: `${props.apiRoute}/${route}?${query}`,
    method: document.collectionSlug && document.id ? "PATCH" : "POST",
    overrides: hasDrafts ? { _status: props.mode === "draft" ? "draft" : "published" } : {},
    skipValidation: props.mode === "draft",
  })

  if (!submission?.res?.ok)
    return {
      ok: false,
      error: "Save failed. Check the field errors in the editor.",
      status: submission?.res?.status ?? null,
    }

  return { ok: true, saved: true, mode: props.mode, id: document.id ?? null }
}
