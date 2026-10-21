// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render } from "@testing-library/react"
import { CursorTrail } from "@/registry/cursor-trail/cursor-trail"
import { CopyButton } from "@/components/site/copy-button"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("timers are cleared on unmount", () => {
  it("CursorTrail clears pending drop timers", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
    const { container, unmount } = render(<CursorTrail items={[<span key="a">a</span>]} spacing={1} lifetime={1000} />)
    const area = container.firstElementChild as HTMLElement
    fireEvent.pointerMove(area, { clientX: 10, clientY: 10 })
    fireEvent.pointerMove(area, { clientX: 40, clientY: 40 })
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("CopyButton clears its reset timer", async () => {
    vi.useFakeTimers()
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const { getByRole, unmount } = render(<CopyButton value="x" />)
    await act(async () => {
      fireEvent.click(getByRole("button"))
    })
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
