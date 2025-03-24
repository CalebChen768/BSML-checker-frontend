"use client"

import { useEffect, useRef } from "react"

interface ModelVisualizationProps {
  worlds: number[]
  relations: Array<[number, number]>
  selectedStates: number[]
  truthValues: Record<string, boolean>
  propositions: number[]
  visible: boolean
}

export function ModelVisualization({
  worlds,
  relations,
  selectedStates,
  truthValues,
  propositions,
  visible,
}: ModelVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !visible) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up a high-DPI canvas for clearer rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set canvas dimensions
    const width = rect.width
    const height = rect.height

    // Calculate the positions of worlds on the circle
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 80
    const worldPositions: Record<number, { x: number; y: number }> = {}

    // Ensure worlds are sorted in numerical order
    const sortedWorlds = [...worlds].sort((a, b) => a - b)

    sortedWorlds.forEach((world, index) => {
      const angle = (index / sortedWorlds.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      worldPositions[world] = { x, y }
    })

    // Draw relations (arrows)
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 2

    // Ensure relations are sorted by from and to values
    const sortedRelations = [...relations].sort((a, b) => {
      if (a[0] === b[0]) {
        return a[1] - b[1]
      }
      return a[0] - b[0]
    })

    function drawSelfLoop(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 35) {
      const loopRadius = 25
      const controlOffsetX = 50
      const controlOffsetY = 100
    
      const startX = x - 20
      const startY = y - radius +5
    
      const cp1X = x - controlOffsetX
      const cp1Y = y - controlOffsetY
      const cp2X = x + controlOffsetX
      const cp2Y = y - controlOffsetY

      const endX = x + 20
      const endY = y - radius + 5
    
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
      ctx.strokeStyle = "#888"
      ctx.lineWidth = 2
      ctx.stroke()
    
      const angle = Math.atan2(endY - cp2Y, endX - cp2X)
      const arrowSize = 10
    
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = "#888"
      ctx.fill()
    }


    // Pass 1: Draw lines (excluding arrowheads)
    sortedRelations.forEach(([from, to]) => {
      const fromPos = worldPositions[from]
      const toPos = worldPositions[to]
      if (!fromPos || !toPos) return
      if (from === to) return // Self-loops are handled later

      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const ndx = dx / length
      const ndy = dy / length
      const nodeRadius = 35
      const startX = fromPos.x + ndx * nodeRadius
      const startY = fromPos.y + ndy * nodeRadius
      const endX = toPos.x - ndx * nodeRadius
      const endY = toPos.y - ndy * nodeRadius

      // 👉 Only draw the line, not the arrowhead
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    })

    // Pass 3: Draw arrowheads (excluding lines)
    sortedRelations.forEach(([from, to]) => {
      const fromPos = worldPositions[from]
      const toPos = worldPositions[to]
      if (!fromPos || !toPos) return

      if (from === to) {
        // Self-loops are handled here (your original drawSelfLoop already includes arrowheads)
        drawSelfLoop(ctx, fromPos.x, fromPos.y, 35)
        return
      }

      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const ndx = dx / length
      const ndy = dy / length
      const nodeRadius = 35
      const endX = toPos.x - ndx * nodeRadius
      const endY = toPos.y - ndy * nodeRadius
      const arrowSize = 10
      const angle = Math.atan2(dy, dx)

      // Draw arrowhead
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = "#888"
      ctx.fill()
    })

    // Draw worlds (circles)
    sortedWorlds.forEach((world) => {
      const pos = worldPositions[world]
      if (!pos) return

      // Draw circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 35, 0, 2 * Math.PI)

      // Fill based on whether the world is in the selected state
      if (selectedStates.includes(world)) {
        ctx.fillStyle = "#a5d8ff" // Selected state is light blue
      } else {
        ctx.fillStyle = "#f1f5f9" // Regular world is light gray
      }
      ctx.fill()

      // Draw border
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw world label
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`W${world}`, pos.x, pos.y)

      // Ensure propositions are sorted in numerical order
      const sortedPropositions = [...propositions].sort((a, b) => a - b)

      // Draw propositions that are true in this world
      const trueProps = sortedPropositions.filter((prop) => truthValues[`${world}-${prop}`])

      if (trueProps.length > 0) {
        const propsText = trueProps.map((p) => `P${p}`).join(", ")
        ctx.font = "12px sans-serif"

        // Add background for better readability
        const textWidth = ctx.measureText(propsText).width
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.fillRect(pos.x - textWidth / 2 - 3, pos.y + 35, textWidth + 6, 20)

        ctx.fillStyle = "#1e293b"
        ctx.fillText(propsText, pos.x, pos.y + 45)
      }
    })

    // Draw legend
    ctx.fillStyle = "#1e293b"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    // Legend for selected states
    ctx.beginPath()
    ctx.arc(30, 30, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#a5d8ff"
    ctx.fill()
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = "#1e293b"
    ctx.fillText("World(s) in State", 55, 30)

    // Legend for regular worlds
    ctx.beginPath()
    ctx.arc(30, 70, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#f1f5f9"
    ctx.fill()
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = "#1e293b"
    ctx.fillText("Regular World", 55, 70)
  }, [worlds, relations, selectedStates, truthValues, propositions, visible])

  return <canvas ref={canvasRef} className={`w-full h-full border rounded-md ${visible ? "block" : "hidden"}`} />
}
