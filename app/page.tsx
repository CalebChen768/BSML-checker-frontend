"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowRight, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MathFormula } from "@/components/math-formula"
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { MathJax, MathJaxContext } from "better-react-mathjax";

// 首先，在顶部导入可视化组件
import { ModelVisualization } from "@/components/model-visualization"

// 定义请求数据的接口
interface ModelEvaluationRequest {
  universe: number[]
  valuation: [number, number[]][]
  relation: [number, number][]
  state: number[]
  formula: string
  isSupport: boolean
}

export default function Home() {
  // State for universe (set of worlds)
  const [worlds, setWorlds] = useState<number[]>([1, 2])
  const [newWorld, setNewWorld] = useState<string>("")

  // State for propositions
  const [propositions, setPropositions] = useState<number[]>([1])
  const [newProposition, setNewProposition] = useState<string>("")
  const [truthValues, setTruthValues] = useState<Record<string, boolean>>({})

  // State for relations between worlds
  const [relations, setRelations] = useState<Array<[number, number]>>([])
  const [relationFrom, setRelationFrom] = useState<string>("")
  const [relationTo, setRelationTo] = useState<string>("")

  // State for selected subset
  const [selectedStates, setSelectedStates] = useState<number[]>([])

  // State for formula
  const [formula, setFormula] = useState<string>("")
  const [entailmentType, setEntailmentType] = useState<"entails" | "not-entails">("entails")

  // State for result
  const [result, setResult] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 在 useState 部分添加可视化状态
  const [showVisualization, setShowVisualization] = useState<boolean>(false)

  // Add a new world to the universe
  const addWorld = () => {
    const worldNum = Number.parseInt(newWorld)
    if (!isNaN(worldNum) && !worlds.includes(worldNum)) {
      // 添加新世界并按数值排序
      const newWorlds = [...worlds, worldNum].sort((a, b) => a - b)
      setWorlds(newWorlds)
      setNewWorld("")
    }
  }

  // Remove a world from the universe
  const removeWorld = (world: number) => {
    setWorlds(worlds.filter((w) => w !== world))

    // Also remove any relations involving this world
    setRelations(relations.filter(([from, to]) => from !== world && to !== world))

    // Remove from selected states
    setSelectedStates(selectedStates.filter((s) => s !== world))
  }

  // Add a new proposition
  const addProposition = () => {
    const propNum = Number.parseInt(newProposition)
    if (!isNaN(propNum) && !propositions.includes(propNum)) {
      // 添加新命题并按数值排序
      const newPropositions = [...propositions, propNum].sort((a, b) => a - b)
      setPropositions(newPropositions)
      setNewProposition("")
    }
  }

  // Remove a proposition
  const removeProposition = (prop: number) => {
    setPropositions(propositions.filter((p) => p !== prop))

    // Remove truth values for this proposition
    const newTruthValues = { ...truthValues }
    worlds.forEach((world) => {
      delete newTruthValues[`${world}-${prop}`]
    })
    setTruthValues(newTruthValues)
  }

  // Toggle truth value for a proposition in a world
  const toggleTruthValue = (world: number, prop: number) => {
    const key = `${world}-${prop}`
    setTruthValues({
      ...truthValues,
      [key]: !truthValues[key],
    })
  }

  // Add a relation between worlds
  const addRelation = () => {
    const from = Number.parseInt(relationFrom)
    const to = Number.parseInt(relationTo)

    if (
      !isNaN(from) &&
      !isNaN(to) &&
      worlds.includes(from) &&
      worlds.includes(to) &&
      !relations.some(([f, t]) => f === from && t === to)
    ) {
      // 添加新关系
      const newRelations = [...relations, [from, to]]
      // 按照from的值排序，如果from相同，则按照to的值排序
      newRelations.sort((a, b) => {
        if (a[0] === b[0]) {
          return a[1] - b[1]
        }
        return a[0] - b[0]
      })
      setRelations(newRelations)
      setRelationFrom("")
      setRelationTo("")
    }
  }

  // Remove a relation
  const removeRelation = (from: number, to: number) => {
    setRelations(relations.filter(([f, t]) => !(f === from && t === to)))
  }

  // Toggle a world in the selected states
  const toggleSelectedState = (world: number) => {
    if (selectedStates.includes(world)) {
      setSelectedStates(selectedStates.filter((s) => s !== world))
    } else {
      // 添加到选定状态并按数值排序
      const newSelectedStates = [...selectedStates, world].sort((a, b) => a - b)
      setSelectedStates(newSelectedStates)
    }
  }

  // 构建valuation数据（每个世界中为真的命题列表）
  const buildValuation = (): [number, number[]][] => {
    return worlds.map((world) => {
      const truePropsList = propositions.filter((prop) => truthValues[`${world}-${prop}`])
      return [world, truePropsList]
    })
  }

  
  const evaluateFormula = async () => {
    setIsLoading(true)
    setResult(null) 
  
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // set time out to 8 seconds
  
    const requestData: ModelEvaluationRequest = {
      universe: [...worlds],
      valuation: buildValuation(),
      relation: [...relations],
      state: [...selectedStates],
      formula: formula,
      isSupport: entailmentType === "entails",
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/input`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      })
  
      clearTimeout(timeoutId) 
  
      if (!response.ok) {
        throw new Error(`Requst failed:  ${response.status}`)
      }
  
      const data = await response.json()
  
      if (!("result" in data)) {
        throw new Error("Invalid response data")
      }
  
      setResult(data.result)
    } catch (error: any) {
      if (error.name === "AbortError") {
        alert("Request timed out. Please try again later.")
      } else {
        console.error("Requst failed: ", error)
        alert(`Requst failed: ${error.message}`)
      }
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  // Renk the world
  const sortedWorlds = [...worlds].sort((a, b) => a - b)

  // Rank the propositions
  const sortedPropositions = [...propositions].sort((a, b) => a - b)

  // Rank the relations
  const sortedRelations = [...relations].sort((a, b) => {
    if (a[0] === b[0]) {
      return a[1] - b[1]
    }
    return a[0] - b[0]
  })

  // 获取蕴含符号的LaTeX表示
  // const getEntailmentLatex = () => {
  //   return entailmentType === "entails" ? "\\mathcal{M}, s \\models \\varphi" : "\\mathcal{M}, s \\not\\models \\varphi"
  // }

  // 获取输入框前的符号
  const getEntailmentSymbol = () => {
    return entailmentType === "entails" ? "\ ⊨\ " : "\ ⫤\ "
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Modal Logic Evaluator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Universe (Worlds) Section */}
        <Card>
          <CardHeader>
            <CardTitle>Universe (Worlds)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="number"
                placeholder="Enter world ID"
                value={newWorld}
                onChange={(e) => setNewWorld(e.target.value)}
                className="w-full"
              />
              <Button onClick={addWorld} size="icon" className="flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {sortedWorlds.map((world) => (
                <div key={world} className="flex items-center space-x-1 bg-secondary p-2 rounded-md">
                  <span>World {world}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeWorld(world)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Propositions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Propositions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="number"
                placeholder="Enter proposition ID"
                value={newProposition}
                onChange={(e) => setNewProposition(e.target.value)}
                className="w-full"
              />
              <Button onClick={addProposition} size="icon" className="flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {sortedPropositions.map((prop) => (
                <div key={prop} className="flex items-center space-x-1 bg-secondary p-2 rounded-md">
                  <span>P{prop}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProposition(prop)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Truth Values Section - 移除折叠和滚动 */}
        <Card>
          <CardHeader>
            <CardTitle>Truth Values</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2">World</th>
                  {sortedPropositions.map((prop) => (
                    <th key={prop} className="text-center p-2">
                      P{prop}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedWorlds.map((world) => (
                  <tr key={world} className="border-t">
                    <td className="p-2">World {world}</td>
                    {sortedPropositions.map((prop) => (
                      <td key={prop} className="text-center p-2">
                        <Checkbox
                          checked={!!truthValues[`${world}-${prop}`]}
                          onCheckedChange={() => toggleTruthValue(world, prop)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Relations Section - 移除折叠和滚动 */}
        <Card>
          <CardHeader>
            <CardTitle>Relations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input
                type="number"
                placeholder="From world"
                value={relationFrom}
                onChange={(e) => setRelationFrom(e.target.value)}
                className="w-full"
              />
              <div className="flex items-center mx-1">
                <ArrowRight className="h-6 w-6" />
              </div>
              <Input
                type="number"
                placeholder="To world"
                value={relationTo}
                onChange={(e) => setRelationTo(e.target.value)}
                className="w-full"
              />
              <Button onClick={addRelation} size="icon" className="flex-shrink-0 h-10 w-10">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {sortedRelations.map(([from, to], index) => (
                <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                  <span>
                    World {from} → World {to}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRelation(from, to)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* State Section */}
        <Card>
          <CardHeader>
            <CardTitle>State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {sortedWorlds.map((world) => (
                <div key={world} className="flex items-center space-x-2">
                  <Checkbox
                    id={`state-${world}`}
                    checked={selectedStates.includes(world)}
                    onCheckedChange={() => toggleSelectedState(world)}
                  />
                  <Label htmlFor={`state-${world}`}>World {world}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formula Evaluation Section - 使用LaTeX渲染数学符号 */}
        <Card>
          <CardHeader>
            <CardTitle>Formula Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 符号选择 */}
              <div className="mb-4">
                <Label className="mb-2 block">Select Entailment Type:</Label>
                <RadioGroup
                  value={entailmentType}
                  onValueChange={(value) => setEntailmentType(value as "entails" | "not-entails")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entails" id="entails" />
                    <Label htmlFor="entails" className="flex items-center">
                    <InlineMath math="M, s \ ⊨\  \varphi" />
                      {/* <span className="ml-2">(Entails)</span> */}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-entails" id="not-entails" />
                    <Label htmlFor="not-entails" className="flex items-center">
                    <InlineMath math="M, s \ ⫤\  \varphi" />
                      {/* <span className="ml-2">(Not Entails)</span> */}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 公式输入 */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium whitespace-nowrap flex items-center">
                  <InlineMath math={`M, s \ ${getEntailmentSymbol()} \ `} />
                </span>
                <Input
                  id="formula"
                  placeholder="e.g., p1 & (p2 -> p3)"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="flex-grow"
                />
              </div>

              <Button onClick={evaluateFormula} disabled={isLoading || !formula.trim()} className="w-full">
                {isLoading ? "Evaluating..." : "Evaluate"}
              </Button>

              {result !== null && (
                <Alert className={result ? "bg-green-50" : "bg-red-50"}>
                  <AlertCircle className={result ? "text-green-600" : "text-red-600"} />
                  <AlertDescription className="ml-2">
                    Result: <span className="font-bold">{result ? "True" : "False"}</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Model Visualization</CardTitle>
          <Button
            onClick={() => {
              // 强制重新渲染可视化
              setShowVisualization(false)
              setTimeout(() => setShowVisualization(true), 50)
            }}
            disabled={worlds.length === 0}
          >
            Generate Visualization
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary p-4 rounded-md h-[600px] flex items-center justify-center">
            {worlds.length > 0 ? (
              <ModelVisualization
                worlds={sortedWorlds}
                relations={sortedRelations}
                selectedStates={selectedStates.sort((a, b) => a - b)}
                truthValues={truthValues}
                propositions={sortedPropositions}
                visible={showVisualization}
              />
            ) : (
              <p className="text-muted-foreground">Add worlds to your universe to generate a visualization.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

