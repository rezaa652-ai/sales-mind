import React from 'react'
import Card from './Card'
import Button from './Button'

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <Card className="text-center py-10">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </Card>
  )
}
