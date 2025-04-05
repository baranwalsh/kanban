"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Settings, Download, Upload, Moon, Sun, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "next-themes"
import type { Board } from "@/components/kanban-board"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavbarProps {
  breadcrumbs: { id: string; title: string }[]
  onBreadcrumbClick: (id: string) => void
  boards: Board[]
  onSearchSelect: (boardId: string, taskId?: string) => void
  onRenameBreadcrumb: (id: string, newTitle: string) => void
  onBack: () => void
}

export function Navbar({
  breadcrumbs,
  onBreadcrumbClick,
  boards,
  onSearchSelect,
  onRenameBreadcrumb,
  onBack,
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [showImportExport, setShowImportExport] = useState(false)
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    {
      boardId: string
      boardTitle: string
      taskId?: string
      taskTitle?: string
    }[]
  >([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [editingBreadcrumb, setEditingBreadcrumb] = useState<string | null>(null)
  const [editingBreadcrumbValue, setEditingBreadcrumbValue] = useState("")
  const breadcrumbsContainerRef = useRef<HTMLDivElement>(null)
  const isDarkMode = resolvedTheme === "dark" || theme?.includes("-dark")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      }
      setCurrentTime(now.toLocaleString("en-US", options))
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results: {
      boardId: string
      boardTitle: string
      taskId?: string
      taskTitle?: string
    }[] = []

    // Search through boards
    boards.forEach((board) => {
      if (board.title.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          boardId: board.id,
          boardTitle: board.title,
        })
      }

      // Search through tasks in each board
      board.tasks.forEach((task) => {
        if (task.title.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            boardId: board.id,
            boardTitle: board.title,
            taskId: task.id,
            taskTitle: task.title,
          })
        }
      })
    })

    setSearchResults(results)
  }

  const handleSearchSelect = (boardId: string, taskId?: string) => {
    onSearchSelect(boardId, taskId)
    setIsSearchFocused(false)
  }

  const handleBreadcrumbDoubleClick = (id: string, title: string) => {
    setEditingBreadcrumb(id)
    setEditingBreadcrumbValue(title)
  }

  const handleBreadcrumbEdit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editingBreadcrumb) {
      onRenameBreadcrumb(editingBreadcrumb, editingBreadcrumbValue)
      setEditingBreadcrumb(null)
    } else if (e.key === "Escape") {
      setEditingBreadcrumb(null)
    }
  }

  const scrollBreadcrumbs = (direction: "left" | "right") => {
    if (breadcrumbsContainerRef.current) {
      const container = breadcrumbsContainerRef.current
      const scrollAmount = 100

      if (direction === "left") {
        container.scrollLeft -= scrollAmount
      } else {
        container.scrollLeft += scrollAmount
      }
    }
  }

  return (
    <div className="relative">
      {/* Gradient shadow at top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/20 to-transparent z-10"></div>

      <nav className="bg-card rounded-b-3xl relative z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://gradient-pause-play.lovable.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block"
                  >
                    <img
                      src="/images/zone-logo.png"
                      alt="Zone Logo"
                      className={`h-8 w-auto relative z-10 transition-opacity duration-300 ${isDarkMode ? "opacity-0" : "opacity-100"}`}
                    />
                    <img
                      src="/images/zone-logo-dark.png"
                      alt="Zone Logo Dark"
                      className={`h-8 w-auto absolute top-0 left-0 transition-opacity duration-300 ${isDarkMode ? "opacity-100" : "opacity-0"}`}
                    />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Need a work/break time timer?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Back button */}
            {breadcrumbs.length > 1 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={onBack}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Breadcrumbs with horizontal scroll */}
            <div className="flex items-center relative flex-grow max-w-[calc(100vw-350px)]">
              {/* Left fade gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card to-transparent z-10"></div>

              {/* Scroll left button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute left-0 z-20 opacity-70 hover:opacity-100"
                onClick={() => scrollBreadcrumbs("left")}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>

              {/* Scrollable breadcrumbs container */}
              <div
                ref={breadcrumbsContainerRef}
                className="flex items-center overflow-x-auto scrollbar-hide px-8 w-full transition-all duration-300"
              >
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.id} className="flex items-center whitespace-nowrap">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground flex-shrink-0" />}
                    {editingBreadcrumb === crumb.id ? (
                      <Input
                        value={editingBreadcrumbValue}
                        onChange={(e) => setEditingBreadcrumbValue(e.target.value)}
                        onKeyDown={handleBreadcrumbEdit}
                        onBlur={() => setEditingBreadcrumb(null)}
                        autoFocus
                        className="h-7 px-2 py-0 min-w-[100px] max-w-[200px]"
                      />
                    ) : (
                      <button
                        onClick={() => onBreadcrumbClick(crumb.id)}
                        onDoubleClick={() => handleBreadcrumbDoubleClick(crumb.id, crumb.title)}
                        className="text-foreground hover:text-foreground/80 font-medium"
                      >
                        {crumb.title}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Right fade gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card to-transparent z-10"></div>

              {/* Scroll right button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute right-0 z-20 opacity-70 hover:opacity-100"
                onClick={() => scrollBreadcrumbs("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-8 h-8 w-40 border-none focus:ring-0 bg-muted rounded-full text-foreground overflow-x-auto"
              />

              {/* Search Results */}
              {searchResults.length > 0 && isSearchFocused && (
                <div className="absolute mt-1 w-60 right-0 bg-popover rounded-md overflow-y-auto z-50 max-h-60 transition-opacity duration-300 opacity-100">
                  <div className="p-2 flex justify-between items-center border-b">
                    <span className="text-xs font-medium text-muted-foreground">Search Results</span>
                  </div>
                  <div className="p-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent/50 rounded-sm flex flex-col"
                        onClick={() => handleSearchSelect(result.boardId, result.taskId)}
                      >
                        <span className="font-medium text-foreground">{result.taskTitle || result.boardTitle}</span>
                        {result.taskTitle && (
                          <span className="text-xs text-muted-foreground">in {result.boardTitle}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date/Time */}
            <div className="text-sm text-foreground">{currentTime}</div>

            {/* Settings */}
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Theme</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          className="h-12 w-full bg-[#2D2B36] hover:bg-[#2D2B36]/90 text-white border-none hover:text-white"
                          onClick={() => {
                            const isDark = theme?.includes("-dark") || theme === "dark"
                            setTheme(isDark ? "noir-dark" : "noir")
                          }}
                        >
                          Noir
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 w-full bg-[#1D7A1D] hover:bg-[#1D7A1D]/90 text-white border-none hover:text-white"
                          onClick={() => {
                            const isDark = theme?.includes("-dark") || theme === "dark"
                            setTheme(isDark ? "grass-dark" : "grass")
                          }}
                        >
                          Grass
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 w-full bg-[#E9A322] hover:bg-[#E9A322]/90 text-white border-none hover:text-white"
                          onClick={() => {
                            const isDark = theme?.includes("-dark") || theme === "dark"
                            setTheme(isDark ? "ochre-dark" : "ochre")
                          }}
                        >
                          Ochre
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 w-full bg-[#2E7DD1] hover:bg-[#2E7DD1]/90 text-white border-none hover:text-white"
                          onClick={() => {
                            const isDark = theme?.includes("-dark") || theme === "dark"
                            setTheme(isDark ? "flow-dark" : "flow")
                          }}
                        >
                          Flow
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Mode</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() => {
                            if (theme === "dark") {
                              setTheme("light")
                            } else if (theme?.includes("-dark")) {
                              setTheme(theme.replace("-dark", ""))
                            } else {
                              setTheme(theme || "light")
                            }
                          }}
                        >
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={() => {
                            if (theme === "light") {
                              setTheme("dark")
                            } else if (!theme?.includes("-dark") && theme !== "dark") {
                              setTheme(`${theme}-dark`)
                            } else {
                              setTheme(theme || "dark")
                            }
                          }}
                        >
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Background Image</h4>
                      <div className="space-y-2">
                        <Input placeholder="Enter image URL..." id="bg-image-url" className="w-full" />
                        <Button
                          className="w-full"
                          onClick={() => {
                            const url = (document.getElementById("bg-image-url") as HTMLInputElement)?.value
                            if (url) {
                              document.body.style.backgroundImage = `url(${url})`
                              document.body.style.backgroundSize = "cover"
                              document.body.style.backgroundPosition = "center"
                            } else {
                              document.body.style.backgroundImage = "none"
                            }
                          }}
                        >
                          Set Background
                        </Button>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <a
                        href="https://modul.so/shagun"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center"
                      >
                        Made by Shagun Baranwal
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Import/Export on hover */}
              <div
                className={`absolute right-0 mt-1 bg-popover rounded-md p-2 z-50 flex flex-col space-y-1 transition-all duration-300 ${
                  showImportExport ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
                onMouseEnter={() => setShowImportExport(true)}
                onMouseLeave={() => setShowImportExport(false)}
              >
                <Button variant="ghost" size="sm" className="justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="ghost" size="sm" className="justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

