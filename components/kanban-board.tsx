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

// Update the ColumnColors type to reflect the new structure
export type ColumnColors = {
  [key: string]: {
    colorKey: string
    dotColorKey: string
  }
}

// Update the COLUMN_COLORS object to have both light and dark variants for each color
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

// Update the DOT_COLORS object to have both light and dark variants
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
  const [transitionKey, setTransitionKey] = useState<number>(0)
  const { resolvedTheme } = useTheme()
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null)

  const dragItem = useRef<any>(null)
  const dragOverItem = useRef<any>(null)
  const prevActiveBoard = useRef<string>(activeBoard)

  const getCurrentBoard = () => {
    return boards.find((board) => board.id === activeBoard) || boards[0]
  }

  const handleBreadcrumbClick = (id: string) => {
    if (id === activeBoard) return

    const index = breadcrumbs.findIndex((crumb) => crumb.id === id)
    if (index >= 0) {
      prevActiveBoard.current = activeBoard
      setTransitionKey((prev) => prev + 1)
      setBreadcrumbs(breadcrumbs.slice(0, index + 1))
      setActiveBoard(id)
    }
  }

  const handleRenameBreadcrumb = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return

    // Update breadcrumbs
    setBreadcrumbs(breadcrumbs.map((crumb) => (crumb.id === id ? { ...crumb, title: newTitle } : crumb)))

    // Update board title
    setBoards(boards.map((board) => (board.id === id ? { ...board, title: newTitle } : board)))
  }

  // Function to find the full path to a task
  const findPathToTask = (taskId: string, boardId: string): { id: string; title: string }[] | null => {
    // First check if this is a direct task in the board
    const board = boards.find((b) => b.id === boardId)
    if (!board) return null

    const task = board.tasks.find((t) => t.id === taskId)
    if (task) {
      return [
        { id: boardId, title: board.title },
        { id: taskId, title: task.title },
      ]
    }

    // If not found, recursively search through subtasks
    const searchSubtasks = (
      tasks: Task[],
      path: { id: string; title: string }[],
    ): { id: string; title: string }[] | null => {
      for (const t of tasks) {
        if (t.id === taskId) {
          return [...path, { id: t.id, title: t.title }]
        }

        if (t.subtasks.length > 0) {
          const subtaskPath = searchSubtasks(t.subtasks, [...path, { id: t.id, title: t.title }])
          if (subtaskPath) return subtaskPath
        }
      }
      return null
    }

    // Search through all boards
    for (const b of boards) {
      const path = searchSubtasks(b.tasks, [{ id: b.id, title: b.title }])
      if (path) return path
    }

    return null
  }

  const handleSearchSelect = (boardId: string, taskId?: string) => {
    prevActiveBoard.current = activeBoard
    setTransitionKey((prev) => prev + 1)

    if (taskId) {
      // Find the full path to the task
      const path = findPathToTask(taskId, boardId)
      if (path) {
        setBreadcrumbs(path)
        setActiveBoard(taskId)
        return
      }
    }

    // If no task ID or path not found, just navigate to the board
    const board = boards.find((b) => b.id === boardId)
    if (board) {
      setBreadcrumbs([{ id: boardId, title: board.title }])
      setActiveBoard(boardId)
    }
  }

  const addTask = (status: "todo" | "in-progress" | "done") => {
    if (!newTaskTexts[status].trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTexts[status],
      status,
      subtasks: [],
    }

    // Add animation class to the new task
    const taskElement = document.createElement("div")
    taskElement.className = "task-enter"
    document.body.appendChild(taskElement)

    setTimeout(() => {
      document.body.removeChild(taskElement)

      setBoards(
        boards.map((board) => {
          if (board.id === activeBoard) {
            return {
              ...board,
              tasks: [...board.tasks, newTask],
            }
          }
          return board
        }),
      )
    }, 10)

    setNewTaskTexts({ ...newTaskTexts, [status]: "" })
  }

  const updateTaskStatus = (taskId: string, newStatus: "todo" | "in-progress" | "done") => {
    setBoards(
      boards.map((board) => {
        if (board.id === activeBoard) {
          return {
            ...board,
            tasks: board.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, status: newStatus }
              }
              return task
            }),
          }
        }
        return board
      }),
    )
  }

  const deleteTask = (taskId: string) => {
    // Find the task element and add exit animation
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`)
    if (taskElement) {
      taskElement.classList.add("task-exit")

      setTimeout(() => {
        setBoards(
          boards.map((board) => {
            if (board.id === activeBoard) {
              return {
                ...board,
                tasks: board.tasks.filter((task) => task.id !== taskId),
              }
            }
            return board
          }),
        )
      }, 300)
    } else {
      // If element not found, just update state
      setBoards(
        boards.map((board) => {
          if (board.id === activeBoard) {
            return {
              ...board,
              tasks: board.tasks.filter((task) => task.id !== taskId),
            }
          }
          return board
        }),
      )
    }
  }

  const renameTask = (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return

    setBoards(
      boards.map((board) => {
        if (board.id === activeBoard) {
          return {
            ...board,
            tasks: board.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, title: newTitle }
              }
              return task
            }),
          }
        }
        return board
      }),
    )
  }

  const deleteColumn = (status: "todo" | "in-progress" | "done") => {
    // Move all tasks from this column to todo
    const tasksToMove = getCurrentBoard().tasks.filter((task) => task.status === status)

    if (tasksToMove.length > 0) {
      const targetStatus = status === "todo" ? "in-progress" : "todo"

      setBoards(
        boards.map((board) => {
          if (board.id === activeBoard) {
            return {
              ...board,
              tasks: board.tasks.map((task) => {
                if (task.status === status) {
                  return { ...task, status: targetStatus }
                }
                return task
              }),
            }
          }
          return board
        }),
      )
    }
  }

  const moveTaskToBoard = (taskId: string, targetBoardId: string) => {
    const currentBoard = getCurrentBoard()
    const taskToMove = currentBoard.tasks.find((task) => task.id === taskId)

    if (!taskToMove) return

    // Remove from current board
    setBoards(
      boards.map((board) => {
        if (board.id === activeBoard) {
          return {
            ...board,
            tasks: board.tasks.filter((task) => task.id !== taskId),
          }
        }
        return board
      }),
    )

    // Add to target board
    setBoards(
      boards.map((board) => {
        if (board.id === targetBoardId) {
          return {
            ...board,
            tasks: [...board.tasks, taskToMove],
          }
        }
        return board
      }),
    )
  }

  const openSubtasks = (task: Task) => {
    prevActiveBoard.current = activeBoard
    setTransitionKey((prev) => prev + 1)

    // Create a new board for subtasks if it doesn't exist
    if (!boards.some((board) => board.id === task.id)) {
      setBoards([
        ...boards,
        {
          id: task.id,
          title: task.title,
          tasks: task.subtasks,
        },
      ])
    }

    // Update breadcrumbs and set active board
    setBreadcrumbs([...breadcrumbs, { id: task.id, title: task.title }])
    setActiveBoard(task.id)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    dragItem.current = taskId
  }

  const handleDragOver = (e: React.DragEvent, status: "todo" | "in-progress" | "done") => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, status: "todo" | "in-progress" | "done") => {
    e.preventDefault()

    if (dragItem.current) {
      updateTaskStatus(dragItem.current, status)
      dragItem.current = null
    }

    setDragOverColumn(null)
  }

  // Add a function to get the appropriate color based on the current theme
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

  // Update the changeColumnColor function
  const changeColumnColor = (status: "todo" | "in-progress" | "done", colorKey: string) => {
    setColumnColors({
      ...columnColors,
      [status]: {
        ...columnColors[status],
        colorKey,
      },
    })
  }

  // Update the changeDotColor function
  const changeDotColor = (status: "todo" | "in-progress" | "done", colorKey: string) => {
    setColumnColors({
      ...columnColors,
      [status]: {
        ...columnColors[status],
        dotColorKey: colorKey,
      },
    })
  }

  // Add a handleBack function:
  const handleBack = () => {
    if (breadcrumbs.length <= 1) return

    // Get the parent breadcrumb
    const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2]

    // Update the transition key for animation
    setTransitionKey((prev) => prev + 1)

    // Update breadcrumbs and active board
    setBreadcrumbs(breadcrumbs.slice(0, breadcrumbs.length - 1))
    setActiveBoard(parentBreadcrumb.id)
  }

  // Check if all subtasks are in the same column and update parent task if needed
  useEffect(() => {
    // Only run this for boards that are subtask boards
    if (activeBoard === "main") return

    // Find the parent board and task
    const findParentTask = (): { boardId: string; taskId: string } | null => {
      for (const board of boards) {
        for (const task of board.tasks) {
          if (task.id === activeBoard) {
            return { boardId: board.id, taskId: task.id }
          }
        }
      }
      return null
    }

    const parent = findParentTask()
    if (!parent) return

    // Get the current board's tasks
    const currentBoard = boards.find((board) => board.id === activeBoard)
    if (!currentBoard || currentBoard.tasks.length === 0) return

    // Check if all tasks are in the same column
    const allTasksInColumn = (status: "todo" | "in-progress" | "done") => {
      return currentBoard.tasks.length > 0 && currentBoard.tasks.every((task) => task.status === status)
    }

    // Store current status to check if we need to update
    const allDone = allTasksInColumn("done")
    const allInProgress = allTasksInColumn("in-progress")

    // Find the parent task's current status
    const parentBoard = boards.find((board) => board.id === parent.boardId)
    if (!parentBoard) return

    const parentTask = parentBoard.tasks.find((task) => task.id === parent.taskId)
    if (!parentTask) return

    // Only update if the status needs to change
    if (allDone && parentTask.status !== "done") {
      setBoards((prev) =>
        prev.map((board) => {
          if (board.id === parent.boardId) {
            return {
              ...board,
              tasks: board.tasks.map((task) => {
                if (task.id === parent.taskId) {
                  return { ...task, status: "done" }
                }
                return task
              }),
            }
          }
          return board
        }),
      )
    } else if (allInProgress && parentTask.status !== "in-progress" && !allDone) {
      setBoards((prev) =>
        prev.map((board) => {
          if (board.id === parent.boardId) {
            return {
              ...board,
              tasks: board.tasks.map((task) => {
                if (task.id === parent.taskId) {
                  return { ...task, status: "in-progress" }
                }
                return task
              }),
            }
          }
          return board
        }),
      )
    }
  }, [activeBoard, boards])

  const currentBoard = getCurrentBoard()
  const todoTasks = currentBoard.tasks.filter((task) => task.status === "todo")
  const inProgressTasks = currentBoard.tasks.filter((task) => task.status === "in-progress")
  const doneTasks = currentBoard.tasks.filter((task) => task.status === "done")

  const taskAnimationClass = "transition-all duration-300 ease-in-out"

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
        boards={boards}
        onSearchSelect={handleSearchSelect}
        onRenameBreadcrumb={handleRenameBreadcrumb}
        onBack={handleBack}
      />

      <div className="flex-1 p-6">
        <div key={transitionKey} className="kanban-transition grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          {/* Todo Column */}
          <div
            className={`${getColumnColor("todo")} rounded-lg p-4 group transition-all duration-300 ${
              dragOverColumn === "todo" ? "scale-95" : ""
            } h-fit`}
            style={{
              minHeight: hoveredColumn === "todo" ? "120px" : "80px",
              paddingBottom: hoveredColumn === "todo" ? "16px" : "8px",
            }}
            onDragOver={(e) => handleDragOver(e, "todo")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "todo")}
            onMouseEnter={() => setHoveredColumn("todo")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-foreground flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`h-2 w-2 rounded-full ${getDotColor("todo")} mr-2 hover:opacity-80 transition-colors`}
                    ></button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Dot Color</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(DOT_COLORS).map(([name, colors]) => (
                          <button
                            key={name}
                            className={`h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity`}
                            onClick={() => changeDotColor("todo", name)}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                To Do
                <span className="ml-2 text-muted-foreground text-sm">{todoTasks.length}</span>
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center" onClick={() => deleteColumn("todo")}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => {
                      const popover = document.createElement("div")
                      popover.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                      popover.onclick = (e) => {
                        if (e.target === popover) document.body.removeChild(popover)
                      }

                      const content = document.createElement("div")
                      content.className = "bg-popover rounded-lg p-4 w-64"
                      content.innerHTML = `
                        <h4 class="font-medium text-sm mb-2">Column Color</h4>
                        <div class="grid grid-cols-3 gap-2">
                          ${Object.entries(COLUMN_COLORS)
                            .map(
                              ([name, colors]) => `
                            <button
                              class="h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity"
                              data-color="${name}"
                            ></button>
                          `,
                            )
                            .join("")}
                        </div>
                      `

                      content.querySelectorAll("button").forEach((btn) => {
                        btn.onclick = () => {
                          const colorName = btn.getAttribute("data-color")
                          if (colorName) changeColumnColor("todo", colorName)
                          document.body.removeChild(popover)
                        }
                      })

                      popover.appendChild(content)
                      document.body.appendChild(popover)
                    }}
                  >
                    <PaintBucket className="mr-2 h-4 w-4" />
                    Change Column Color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 mb-3">
              {todoTasks.map((task) => (
                <div key={task.id} className={taskAnimationClass} data-task-id={task.id}>
                  <TaskCard
                    task={task}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onRename={renameTask}
                    onMoveToBoard={moveTaskToBoard}
                    onClick={() => openSubtasks(task)}
                    availableBoards={boards.filter((board) => board.id !== activeBoard)}
                  />
                </div>
              ))}
            </div>

            <div
              className={`flex items-center space-x-2 ${
                columnColors.todo.colorKey !== "default" ? "opacity-90" : ""
              } transition-opacity duration-300 ${hoveredColumn === "todo" ? "opacity-100" : "opacity-0"}`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts.todo}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, todo: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask("todo")
                  }
                }}
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
            } h-fit`}
            style={{
              minHeight: hoveredColumn === "in-progress" ? "120px" : "80px",
              paddingBottom: hoveredColumn === "in-progress" ? "16px" : "8px",
            }}
            onDragOver={(e) => handleDragOver(e, "in-progress")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "in-progress")}
            onMouseEnter={() => setHoveredColumn("in-progress")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-foreground flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`h-2 w-2 rounded-full ${getDotColor("in-progress")} mr-2 hover:opacity-80 transition-colors`}
                    ></button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Dot Color</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(DOT_COLORS).map(([name, colors]) => (
                          <button
                            key={name}
                            className={`h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity`}
                            onClick={() => changeDotColor("in-progress", name)}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                In Progress
                <span className="ml-2 text-muted-foreground text-sm">{inProgressTasks.length}</span>
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center" onClick={() => deleteColumn("in-progress")}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => {
                      const popover = document.createElement("div")
                      popover.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                      popover.onclick = (e) => {
                        if (e.target === popover) document.body.removeChild(popover)
                      }

                      const content = document.createElement("div")
                      content.className = "bg-popover rounded-lg p-4 w-64"
                      content.innerHTML = `
                        <h4 class="font-medium text-sm mb-2">Column Color</h4>
                        <div class="grid grid-cols-3 gap-2">
                          ${Object.entries(COLUMN_COLORS)
                            .map(
                              ([name, colors]) => `
                            <button
                              class="h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity"
                              data-color="${name}"
                            ></button>
                          `,
                            )
                            .join("")}
                        </div>
                      `

                      content.querySelectorAll("button").forEach((btn) => {
                        btn.onclick = () => {
                          const colorName = btn.getAttribute("data-color")
                          if (colorName) changeColumnColor("in-progress", colorName)
                          document.body.removeChild(popover)
                        }
                      })

                      popover.appendChild(content)
                      document.body.appendChild(popover)
                    }}
                  >
                    <PaintBucket className="mr-2 h-4 w-4" />
                    Change Column Color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 mb-3">
              {inProgressTasks.map((task) => (
                <div key={task.id} className={taskAnimationClass} data-task-id={task.id}>
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onRename={renameTask}
                    onMoveToBoard={moveTaskToBoard}
                    onClick={() => openSubtasks(task)}
                    availableBoards={boards.filter((board) => board.id !== activeBoard)}
                  />
                </div>
              ))}
            </div>

            <div
              className={`flex items-center space-x-2 ${
                columnColors["in-progress"].colorKey !== "default" ? "opacity-90" : ""
              } transition-opacity duration-300 ${hoveredColumn === "in-progress" ? "opacity-100" : "opacity-0"}`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts["in-progress"]}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, "in-progress": e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask("in-progress")
                  }
                }}
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
            } h-fit`}
            style={{
              minHeight: hoveredColumn === "done" ? "120px" : "80px",
              paddingBottom: hoveredColumn === "done" ? "16px" : "8px",
            }}
            onDragOver={(e) => handleDragOver(e, "done")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "done")}
            onMouseEnter={() => setHoveredColumn("done")}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-foreground flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`h-2 w-2 rounded-full ${getDotColor("done")} mr-2 hover:opacity-80 transition-colors`}
                    ></button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Dot Color</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(DOT_COLORS).map(([name, colors]) => (
                          <button
                            key={name}
                            className={`h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity`}
                            onClick={() => changeDotColor("done", name)}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                Done
                <span className="ml-2 text-muted-foreground text-sm">{doneTasks.length}</span>
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center" onClick={() => deleteColumn("done")}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Column
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center"
                    onClick={() => {
                      const popover = document.createElement("div")
                      popover.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                      popover.onclick = (e) => {
                        if (e.target === popover) document.body.removeChild(popover)
                      }

                      const content = document.createElement("div")
                      content.className = "bg-popover rounded-lg p-4 w-64"
                      content.innerHTML = `
                        <h4 class="font-medium text-sm mb-2">Column Color</h4>
                        <div class="grid grid-cols-3 gap-2">
                          ${Object.entries(COLUMN_COLORS)
                            .map(
                              ([name, colors]) => `
                            <button
                              class="h-8 rounded-md ${colors.light} hover:opacity-90 transition-opacity"
                              data-color="${name}"
                            ></button>
                          `,
                            )
                            .join("")}
                        </div>
                      `

                      content.querySelectorAll("button").forEach((btn) => {
                        btn.onclick = () => {
                          const colorName = btn.getAttribute("data-color")
                          if (colorName) changeColumnColor("done", colorName)
                          document.body.removeChild(popover)
                        }
                      })

                      popover.appendChild(content)
                      document.body.appendChild(popover)
                    }}
                  >
                    <PaintBucket className="mr-2 h-4 w-4" />
                    Change Column Color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 mb-3">
              {doneTasks.map((task) => (
                <div key={task.id} className={taskAnimationClass} data-task-id={task.id}>
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onRename={renameTask}
                    onMoveToBoard={moveTaskToBoard}
                    onClick={() => openSubtasks(task)}
                    availableBoards={boards.filter((board) => board.id !== activeBoard)}
                  />
                </div>
              ))}
            </div>

            <div
              className={`flex items-center space-x-2 ${
                columnColors.done.colorKey !== "default" ? "opacity-90" : ""
              } transition-opacity duration-300 ${hoveredColumn === "done" ? "opacity-100" : "opacity-0"}`}
            >
              <Input
                placeholder="Add a task..."
                value={newTaskTexts.done}
                onChange={(e) => setNewTaskTexts({ ...newTaskTexts, done: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask("done")
                  }
                }}
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

