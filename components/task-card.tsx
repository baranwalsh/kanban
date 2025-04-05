"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MoreHorizontal, Trash2, Edit, ChevronRight } from "lucide-react"
import type { Board, Task } from "@/components/kanban-board"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TaskCardProps {
  task: Task
  onDelete: () => void
  onRename: (taskId: string, newTitle: string) => void
  onMoveToBoard: (taskId: string, boardId: string) => void
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  availableBoards: Board[]
}

export function TaskCard({
  task,
  onDelete,
  onRename,
  onMoveToBoard,
  onClick,
  onDragStart,
  availableBoards,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (isMenuOpen || isEditing) return
    onClick()
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(true)
  }

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setIsMenuOpen(false)
    setEditValue(task.title)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue !== task.title) {
      onRename(task.id, editValue)
    }
    // Don't set isEditing to false here - we'll let the blur event handle that
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === "Enter" && e.shiftKey) {
      // Allow multiline input with Shift+Enter
      setEditValue((prev) => prev + "\n")
    } else if (e.key === "Enter") {
      handleEditSubmit()
      setIsEditing(false)
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(task.title)
    }
  }

  // Check if all subtasks are done
  const allSubtasksDone = task.subtasks.length > 0 && task.subtasks.every((subtask) => subtask.status === "done")

  // Filter out done subtasks for the hover preview
  const activeSubtasks = task.subtasks.filter((subtask) => subtask.status !== "done")

  return (
    <div
      className="bg-card border rounded-md p-3 cursor-pointer group transition-colors"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      draggable={!isEditing}
      onDragStart={onDragStart}
    >
      <div className="flex justify-between items-start">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              handleEditSubmit()
              setIsEditing(false)
            }}
            className="h-auto min-h-[32px] px-2 py-1 min-w-[100px] max-w-full"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h4 className="font-medium text-foreground break-words whitespace-pre-wrap">{task.title}</h4>
        )}
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${showMenu ? "opacity-100" : "opacity-0"} group-hover:opacity-100 transition-opacity`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="flex items-center" onClick={handleEditStart}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {task.subtasks.length > 0 && (
        <div className="mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent/50">
                {task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}
              </Badge>
            </PopoverTrigger>
            {task.subtasks.length > 0 && (
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium mb-1">Subtasks</h4>
                  {task.subtasks.map((subtask) => (
                    <button
                      key={subtask.id}
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent/50 rounded-sm flex items-center justify-between"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClick()
                      }}
                    >
                      <span>{subtask.title}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>
      )}
    </div>
  )
}

