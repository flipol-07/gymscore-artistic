'use client'

import { use } from 'react'
import { Navbar } from '@/shared/components/navbar'
import { Footer } from '@/shared/components/footer'
import { JudgePanel } from '@/features/competitions/components/judge-panel'

interface Props {
  params: Promise<{ slug: string; categoryId: string }>
}

export default function JudgePage({ params: paramsPromise }: Props) {
  const { slug, categoryId } = use(paramsPromise)
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: '0 auto' }}>
        <JudgePanel slug={slug} promotionId={categoryId} />
      </main>
      <Footer />
    </>
  )
}
