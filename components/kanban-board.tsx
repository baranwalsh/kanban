"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, PaintBucket, ChevronDown } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "next-themes"

export type Task = {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
  subtasks: Task[]
}

export type Board = {
  id: string
  title: string
  tasks: Task[]
}

// Column Colors
export type ColumnColors = {
  [key: string]: {
    colorKey: string
    dotColorKey: string
  }
}

const COLUMN_COLORS = {
  default: {
    light: "bg-card",
    dark: "bg-card",
    dot: {
      light: "bg-gray-400",
      dark: "bg-gray-600",
    },
  },
  blue: {
    light: "bg-blue-100/95",
    dark: "bg-blue-900/30",
    dot: {
      light: "bg-blue-400",
      dark: "bg-blue-600",
    },
  },
  green: {
    light: "bg-green-100/95",
    dark: "bg-green-900/30",
    dot: {
      light: "bg-green-400",
      dark: "bg-green-600",
    },
  },
  yellow: {
    light: "bg-yellow-100/95",
    dark: "bg-yellow-900/30",
    dot: {
      light: "bg-yellow-400",
      dark: "bg-yellow-600",
    },
  },
  purple: {
    light: "bg-purple-100/95",
    dark: "bg-purple-900/30",
    dot: {
      light: "bg-purple-400",
      dark: "bg-purple-600",
    },
  },
  pink: {
    light: "bg-pink-100/95",
    dark: "bg-pink-900/30",
    dot: {
      light: "bg-pink-400",
      dark: "bg-pink-600",
    },
  },
}

const DOT_COLORS = {
  gray: {
    light: "bg-gray-400",
    dark: "bg-gray-600",
  },
  blue: {
    light: "bg-blue-400",
    dark: "bg-blue-600",
  },
  green: {
    light: "bg-green-400",
    dark: "bg-green-600",
  },
  yellow: {
    light: "bg-yellow-400",
    dark: "bg-yellow-600",
  },
  purple: {
    light: "bg-purple-400",
    dark: "bg-purple-600",
  },
  pink: {
    light: "bg-pink-400",
    dark: "bg-pink-600",
  },
}

export function KanbanBoard() {
  const [boards, setBoards] = useState<Board[]>([
    {
      id: "main",
      title: "Main Board",
      tasks: [
        {
          id: "1",
          title: "Research competitors",
          status: "todo",
          subtasks: [
            { id: "1-1", title: "Identify top 5 competitors", status: "todo", subtasks: [] },
            { id: "1-2", title: "Analyze pricing models", status: "todo", subtasks: [] },
          ],
        },
        {
          id: "2",
          title: "Design new landing page",
          status: "in-progress",
          subtasks: [
            { id: "2-1", title: "Create wireframes", status: "done", subtasks: [] },
            { id: "2-2", title: "Design UI components", status: "in-progress", subtasks: [] },
            { id: "2-3", title: "Review with team", status: "todo", subtasks: [] },
          ],
        },
        {
          id: "3",
          title: "Implement user authentication",
          status: "done",
          subtasks: [],
        },
      ],
    },
  ])
  const [activeBoard, setActiveBoard] = useState<string>("main")
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; title: string }[]>([{ id: "main", title: "Main Board" }])
  const [newTaskTexts, setNewTaskTexts] = useState({
    todo: "",
    "in-progress": "",
    done: "",
  })
  const [columnColors, setColumnColors] = useState<ColumnColors>({
    todo: { colorKey: "default", dotColorKey: "gray" },
    "in-progress": { colorKey: "default", dotColorKey: "blue" },
    done: { colorKey: "default", dotColorKey: "green" },
  })
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null)

  const getCurrentBoard = () => boards.find((board) => board.id === activeBoard) || boards[0]
  const currentBoard = getCurrentBoard()
  const todoTasks = currentBoard.tasks.filter((task) => task.status === "todo")
  const inProgressTasks = currentBoard.tasks.filter((task) => task.status === "in-progress")
  const doneTasks = currentBoard.tasks.filter((task) => task.status === "done")

  const getColumnColor = (status: "todo" | "in-progress" | "done") => {
    const colorKey = columnColors[status].colorKey
    const isDark = resolvedTheme === "dark" || resolvedTheme?.includes("-dark")
    return COLUMN_COLORS[colorKey as keyof typeof COLUMN_COLORS][isDark ? "dark" : "light"]
  }

  const getDotColor = (status: "todo" | "in-progress" | "done") => {
    const dotColorKey = columnColors[status].dotColorKey
    const isDark = resolvedTheme === "dark" || resolvedTheme?.includes("-dark")
    return DOT_COLORS[dotColorKey as keyof typeof DOT_COLORS][isDark ? "dark" : "light"]
  }

  const addTask = (status: "todo" | "in-progress" | "done") => {
    if (!newTaskTexts[status].trim()) return
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTexts[status],
      status,
      subtasks: [],
    }
    setBoards(
      boards.map((board) =>
        board.id === activeBoard ? { ...board, tasks: [...board.tasks, newTask] } : board
      )
    )
    setNewTaskTexts({ ...newTaskTexts, [status]: "" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar breadcrumbs={breadcrumbs} />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          {/* Todo Column */}
          <div
            className={`${getColumnColor("todo")} rounded-lg p-4 group transition-all duration-300 ${
              dragOverColumn === "todo" ? "scale-95" : ""
            } flex flex-col justify-between`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => console.log("Dropped")}
            onMouseEnter={() => setHoveredColumn("todo")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div>
              <h3 className="font-medium text-foreground flex items-center mb-3">
                To Do <span className="ml-2 text-muted-foreground text-sm">{todoTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            <div
              className={`flex items-center space-x-2 transition-opacity duration-300 ${
                hoveredColumn === "todo" ? "opacity-100 pb-4" : "opacity-0 pb-0"
              }`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts.todo}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, todo: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTask("todo")}
                className="text-sm border-none focus:ring-0"
              />
              <Button size="sm" variant="ghost" onClick={() => addTask("todo")} disabled={!newTaskTexts.todo.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* In Progress Column */}
          <div
            className={`${getColumnColor("in-progress")} rounded-lg p-4 group transition-all duration-300 ${
              dragOverColumn === "in-progress" ? "scale-95" : ""
            } flex flex-col justify-between`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => console.log("Dropped")}
            onMouseEnter={() => setHoveredColumn("in-progress")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div>
              <h3 className="font-medium text-foreground flex items-center mb-3">
                In Progress <span className="ml-2 text-muted-foreground text-sm">{inProgressTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            <div
              className={`flex items-center space-x-2 transition-opacity duration-300 ${
                hoveredColumn === "in-progress" ? "opacity-100 pb-4" : "opacity-0 pb-0"
              }`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts["in-progress"]}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, "in-progress": e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTask("in-progress")}
                className="text-sm border-none focus:ring-0"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => addTask("in-progress")}
                disabled={!newTaskTexts["in-progress"].trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Done Column */}
          <div
            className={`${getColumnColor("done")} rounded-lg p-4 group transition-all duration-300 ${
              dragOverColumn === "done" ? "scale-95" : ""
            } flex flex-col justify-between`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => console.log("Dropped")}
            onMouseEnter={() => setHoveredColumn("done")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div>
              <h3 className="font-medium text-foreground flex items-center mb-3">
                Done <span className="ml-2 text-muted-foreground text-sm">{doneTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
            <div
              className={`flex items-center space-x-2 transition-opacity duration-300 ${
                hoveredColumn === "done" ? "opacity-100 pb-4" : "opacity-0 pb-0"
              }`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts.done}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, done: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTask("done")}
                className="text-sm border-none focus:ring-0"
              />
              <Button size="sm" variant="ghost" onClick={() => addTask("done")} disabled={!newTaskTexts.done.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
