"use client"

import { InHouseSection } from "./components/in-house-section"
import { OutsideSection } from "./components/outside-section"
import { MOCK_DATA } from "./types"

interface KeyTakeawaysProps {
  companyId: number
}

export function KeyTakeaways({ companyId }: KeyTakeawaysProps) {
  return (
    <div className="space-y-8 p-8">
      <InHouseSection data={MOCK_DATA.inHouse} />
      <OutsideSection data={MOCK_DATA.outside} />
    </div>
  )
} 