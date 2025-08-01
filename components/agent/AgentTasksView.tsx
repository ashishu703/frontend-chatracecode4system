"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Clock, CheckCircle, AlertCircle, Calendar, User, Flag } from 'lucide-react'
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import serverHandler from '@/utils/serverHandler'
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: string
  due_date: string
  created_at: string
  comment?: string
}

export default function AgentTasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const agent = useSelector((state: RootState) => state.agentAuth.agent)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response: any = await serverHandler.get('/api/agent/get_my_task')
      setTasks(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      // Use mock data for now
      setTasks([
        {
          id: 1,
          title: "Follow up with customer",
          description: "Contact customer about their inquiry regarding order #12345",
          status: "pending",
          priority: "high",
          due_date: "2024-01-15T00:00:00.000Z",
          created_at: "2024-01-01T00:00:00.000Z"
        },
        {
          id: 2,
          title: "Review support ticket",
          description: "Review and respond to support ticket #67890",
          status: "completed",
          priority: "medium",
          due_date: "2024-01-10T00:00:00.000Z",
          created_at: "2024-01-01T00:00:00.000Z",
          comment: "Resolved customer issue successfully"
        },
        {
          id: 3,
          title: "Update documentation",
          description: "Update FAQ section with new product information",
          status: "pending",
          priority: "low",
          due_date: "2024-01-20T00:00:00.000Z",
          created_at: "2024-01-01T00:00:00.000Z"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const markTaskComplete = async (taskId: number, comment: string) => {
    setSubmitting(true)
    try {
      await serverHandler.post('/api/agent/mark_task_complete', {
        id: taskId,
        comment: comment
      })
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed', comment }
          : task
      ))
      
      toast({
        title: "Success",
        description: "Task marked as completed",
        variant: "default"
      })
    } catch (error) {
      console.error('Failed to mark task complete:', error)
      toast({
        title: "Error",
        description: "Failed to mark task as completed",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your assigned tasks and responsibilities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {tasks.filter(t => t.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-sm">
            {tasks.filter(t => t.status === 'completed').length} Completed
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchTasks} className="w-full md:w-auto">
              <i className="fas fa-refresh mr-2"></i>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <i className="fas fa-tasks text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500">No tasks match your current filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                           isOverdue(task.due_date) ? <AlertCircle className="w-3 h-3 mr-1" /> : 
                           <Clock className="w-3 h-3 mr-1" />}
                          {task.status}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          <Flag className="w-3 h-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {formatDate(task.due_date)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Assigned to: {agent?.name || 'You'}
                      </div>
                    </div>
                    {task.comment && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Comment:</strong> {task.comment}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {task.status === 'pending' && (
                      <Button
                        onClick={() => {
                          const comment = prompt('Add a comment (optional):')
                          if (comment !== null) {
                            markTaskComplete(task.id, comment)
                          }
                        }}
                        disabled={submitting}
                        className="w-full md:w-auto"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Mark Complete
                      </Button>
                    )}
                    <Button variant="outline" className="w-full md:w-auto">
                      <i className="fas fa-eye mr-2"></i>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 