"use client"

import { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathFormulaProps {
  formula: string
  inline?: boolean
  className?: string
}

export function MathFormula({ formula, inline = true, className = "" }: MathFormulaProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: !inline,
      })
    }
  }, [formula, inline])

  return <span ref={containerRef} className={className} />
}

