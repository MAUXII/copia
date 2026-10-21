// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { ToolbarTooltip } from "@/registry/toolbar-tooltip/toolbar-tooltip"

afterEach(cleanup)

const items = ["One", "Two", "Three"].map((label) => ({ label, icon: <span>{label[0]}</span> }))

describe("ToolbarTooltip keyboard", () => {
  it("has a single tab stop (roving tabindex)", () => {
    const { getAllByRole } = render(<ToolbarTooltip items={items} />)
    const tabbable = getAllByRole("button").filter((b) => b.tabIndex === 0)
    expect(tabbable).toHaveLength(1)
  })

  it("moves focus with arrow keys, Home and End, wrapping around", () => {
    const { getAllByRole, getByRole } = render(<ToolbarTooltip items={items} />)
    const [one, two, three] = getAllByRole("button")
    one.focus()
    fireEvent.keyDown(getByRole("toolbar"), { key: "ArrowRight" })
    expect(document.activeElement).toBe(two)
    fireEvent.keyDown(getByRole("toolbar"), { key: "End" })
    expect(document.activeElement).toBe(three)
    fireEvent.keyDown(getByRole("toolbar"), { key: "ArrowRight" })
    expect(document.activeElement).toBe(one)
    fireEvent.keyDown(getByRole("toolbar"), { key: "ArrowLeft" })
    expect(document.activeElement).toBe(three)
    fireEvent.keyDown(getByRole("toolbar"), { key: "Home" })
    expect(document.activeElement).toBe(one)
    expect(getAllByRole("button").filter((b) => b.tabIndex === 0)).toEqual([one])
  })
})
