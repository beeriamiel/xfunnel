'use server'

export async function getCompanyFromParams(searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>) {
  const searchParams = await searchParamsPromise
  return typeof searchParams.company === 'string' ? searchParams.company : null
} 