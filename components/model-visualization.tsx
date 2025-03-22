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

    // 设置高DPI画布以获得更清晰的渲染
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // 清除画布
    ctx.clearRect(0, 0, rect.width, rect.height)

    // 设置画布尺寸
    const width = rect.width
    const height = rect.height

    // 计算世界在圆上的位置
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 80
    const worldPositions: Record<number, { x: number; y: number }> = {}

    // 确保世界按照数值顺序排列
    const sortedWorlds = [...worlds].sort((a, b) => a - b)

    sortedWorlds.forEach((world, index) => {
      const angle = (index / sortedWorlds.length) * 2 * Math.PI
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      worldPositions[world] = { x, y }
    })

    // 绘制关系（箭头）
    ctx.strokeStyle = "#888"
    ctx.lineWidth = 2

    // 确保关系按照from和to的数值顺序排列
    const sortedRelations = [...relations].sort((a, b) => {
      if (a[0] === b[0]) {
        return a[1] - b[1]
      }
      return a[0] - b[0]
    })

    sortedRelations.forEach(([from, to]) => {
      const fromPos = worldPositions[from]
      const toPos = worldPositions[to]

      if (!fromPos || !toPos) return

      // 计算方向向量
      const dx = toPos.x - fromPos.x
      const dy = toPos.y - fromPos.y
      const length = Math.sqrt(dx * dx + dy * dy)

      // 归一化方向向量
      const ndx = dx / length
      const ndy = dy / length

      // 计算起点和终点（调整以不与圆重叠）
      const nodeRadius = 35
      const startX = fromPos.x + ndx * nodeRadius
      const startY = fromPos.y + ndy * nodeRadius
      const endX = toPos.x - ndx * nodeRadius
      const endY = toPos.y - ndy * nodeRadius

      // 绘制线
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()

      // 绘制箭头头部
      const arrowSize = 10
      const angle = Math.atan2(dy, dx)
      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = "#888"
      ctx.fill()
    })

    // 绘制世界（圆圈）
    sortedWorlds.forEach((world) => {
      const pos = worldPositions[world]
      if (!pos) return

      // 绘制圆
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 35, 0, 2 * Math.PI)

      // 根据是否在选定状态中填充
      if (selectedStates.includes(world)) {
        ctx.fillStyle = "#a5d8ff" // 选定状态为浅蓝色
      } else {
        ctx.fillStyle = "#f1f5f9" // 常规世界为浅灰色
      }
      ctx.fill()

      // 绘制边框
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 2
      ctx.stroke()

      // 绘制世界标签
      ctx.fillStyle = "#1e293b"
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`W${world}`, pos.x, pos.y)

      // 确保命题按照数值顺序排列
      const sortedPropositions = [...propositions].sort((a, b) => a - b)

      // 绘制在此世界中为真的命题
      const trueProps = sortedPropositions.filter((prop) => truthValues[`${world}-${prop}`])

      if (trueProps.length > 0) {
        const propsText = trueProps.map((p) => `P${p}`).join(", ")
        ctx.font = "12px sans-serif"

        // 添加背景以提高可读性
        const textWidth = ctx.measureText(propsText).width
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.fillRect(pos.x - textWidth / 2 - 3, pos.y + 35, textWidth + 6, 20)

        ctx.fillStyle = "#1e293b"
        ctx.fillText(propsText, pos.x, pos.y + 45)
      }
    })

    // 绘制图例
    ctx.fillStyle = "#1e293b"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    // 选定状态图例
    ctx.beginPath()
    ctx.arc(30, 30, 15, 0, 2 * Math.PI)
    ctx.fillStyle = "#a5d8ff"
    ctx.fill()
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = "#1e293b"
    ctx.fillText("Selected State", 55, 30)

    // 常规世界图例
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

