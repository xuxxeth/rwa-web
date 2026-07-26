import type { IStockActionEvent } from '@/service/event/types'

export const EVENT_STATUS_ORDER: Record<number, number> = {
  1: 0,
  0: 1,
  2: 2,
  3: 3,
}

export function getEventSortTime(event: IStockActionEvent) {
  const extendedEvent = event as IStockActionEvent & { createTime?: number; createdTime?: number }
  return extendedEvent.createTime ?? extendedEvent.createdTime ?? event.exchangeStartTime ?? event.id
}

export function sortEventsByStatusAndTime(events: IStockActionEvent[]) {
  return [...events].sort((left, right) => {
    const leftStatus = EVENT_STATUS_ORDER[left.showStatus] ?? 99
    const rightStatus = EVENT_STATUS_ORDER[right.showStatus] ?? 99

    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus
    }

    return getEventSortTime(right) - getEventSortTime(left)
  })
}
