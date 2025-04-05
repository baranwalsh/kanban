"use client"

import { useState } from "react"
import type { Task } from "@/components/kanban-board"
import { KanbanBoard } from "@/components/kanban-board"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TaskDialogProps {
  task: Task
  onClose: () => void
  onAddSubtask: (subtask: Task) => void
  onUpdateSubtasks: (subtasks: Task[]) => void
}

export function TaskDialog({ task, onClose, onAddSubtask, onUpdateSubtasks }: TaskDialogProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [subtasks, setSubtasks] = useState<Task[]>(task.subtasks)

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Task = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      status: "todo",
      subtasks: [],
    }

    const updatedSubtasks = [...subtasks, newSubtask]
    setSubtasks(updatedSubtasks)
    onAddSubtask(newSubtask)
    setNewSubtaskTitle("")
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <KanbanBoard parentTask={task} onBack={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

