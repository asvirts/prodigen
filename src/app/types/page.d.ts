// Redefine the Next.js PageProps to ensure it's properly typed
export type PageProps = {
  params: { [key: string]: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
