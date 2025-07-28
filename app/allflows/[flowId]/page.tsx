"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FlowBuilder } from "@/components/flow-integration/flow-builder"
import serverHandler from "@/utils/serverHandler"
import { useToast } from "@/hooks/use-toast"

export default function EditFlowPage() {
  const params = useParams()
  const flowId = params.flowId as string
  const [flowData, setFlowData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadFlowData = async () => {
      if (!flowId) return
      
      try {
        setLoading(true)
        console.log('Loading flow with ID:', flowId);
        const response = await serverHandler.post('/api/chat_flow/get_by_flow_id', { 
          flowId: flowId 
        })
        
        console.log('API Response:', response.data);
        
        if ((response.data as any).success) {
          console.log('Flow data loaded successfully:', response.data);
          console.log('Flow nodes:', (response.data as any).nodes);
          console.log('Flow edges:', (response.data as any).edges);
          console.log('Flow title:', (response.data as any).title);
          console.log('Flow ID:', (response.data as any).flow_id || (response.data as any).flowId);
          // The data is directly in response.data, not response.data.data
          setFlowData(response.data)
        } else {
          console.error('Failed to load flow:', response.data);
          toast({
            title: "Error",
            description: (response.data as any).msg || "Failed to load flow",
            variant: "destructive"
          })
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load flow",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadFlowData()
  }, [flowId, toast])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading flow...</p>
        </div>
      </div>
    )
  }

  if (!flowData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Flow not found</h2>
          <p className="text-slate-500">The requested flow could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full">
      <FlowBuilder initialFlowData={flowData} />
    </div>
  )
} 