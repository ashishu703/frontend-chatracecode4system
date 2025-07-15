"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { adminPlansAPI, Plan } from "@/utils/api/plans"
import { formatPrice } from "@/utils/payment"
import { toast } from "sonner"

export default function PlansManagement() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingPlans, setFetchingPlans] = useState(true)

  const [newPlan, setNewPlan] = useState<Omit<Plan, "id">>({
    title: "",
    short_description: "",
    is_trial: false,
    price: 0,
    price_strike: 0,
    plan_duration_in_days: 30,
    contact_limit: 100,
    allow_tag: false,
    allow_note: false,
    allow_chatbot: false,
    allow_api: false,
  })

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true)
      const response = await adminPlansAPI.getPlans()
      if ((response as any).success) {
        setPlans((response as any).data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to fetch plans')
    } finally {
      setFetchingPlans(false)
    }
  }

  const handleAddPlan = async () => {
    try {
      setLoading(true)
      const response = await adminPlansAPI.addPlan(newPlan)
      if (response.success) {
        toast.success('Plan added successfully')
    setNewPlan({
      title: "",
          short_description: "",
          is_trial: false,
          price: 0,
          price_strike: 0,
          plan_duration_in_days: 30,
          contact_limit: 100,
          allow_tag: false,
          allow_note: false,
          allow_chatbot: false,
          allow_api: false,
    })
    setShowAddForm(false)
        fetchPlans() // Refresh the plans list
      }
    } catch (error) {
      console.error('Error adding plan:', error)
      toast.error('Failed to add plan')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (id: number) => {
    try {
      const response = await adminPlansAPI.deletePlan(id)
      if (response.success) {
        toast.success('Plan deleted successfully')
        fetchPlans() // Refresh the plans list
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('Failed to delete plan')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">💳</span>
              Plans Management
            </CardTitle>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <i className="fas fa-plus mr-2"></i>
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  {plan.is_trial && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Trial</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Price:</strong> {formatPrice(plan.price)}
                  </p>
                  {plan.price_strike && plan.price_strike > 0 && (
                    <p>
                      <strong>Crossed Price:</strong> <span className="line-through">{formatPrice(plan.price_strike)}</span>
                    </p>
                  )}
                  <p>
                    <strong>Duration:</strong> {plan.plan_duration_in_days} days
                  </p>
                  <p>
                    <strong>Contacts Limit:</strong> {plan.contact_limit}
                  </p>
                  <p>{plan.short_description}</p>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Add New Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Plan Title *</Label>
                  <Input
                    id="title"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                    placeholder="Enter plan title"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newPlan.is_trial}
                    onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_trial: checked })}
                  />
                  <Label>Is Trial Plan</Label>
                </div>

                <div>
                  <Label htmlFor="price">Plan Price (in paise) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 50000 (₹500)"
                  />
                </div>

                <div>
                  <Label htmlFor="price_strike">Plan Price (Crossed) in paise</Label>
                  <Input
                    id="price_strike"
                    type="number"
                    value={newPlan.price_strike}
                    onChange={(e) => setNewPlan({ ...newPlan, price_strike: parseInt(e.target.value) || 0 })}
                    placeholder="Example: 100000 (₹1000)"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Plan Duration (days) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newPlan.plan_duration_in_days}
                    onChange={(e) => setNewPlan({ ...newPlan, plan_duration_in_days: parseInt(e.target.value) || 30 })}
                    placeholder="e.g., 30 for monthly"
                  />
                </div>

                <div>
                  <Label htmlFor="contactsLimit">Phonebook Contacts Limit *</Label>
                  <Input
                    id="contactsLimit"
                    type="number"
                    value={newPlan.contact_limit}
                    onChange={(e) => setNewPlan({ ...newPlan, contact_limit: parseInt(e.target.value) || 100 })}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={newPlan.short_description}
                    onChange={(e) => setNewPlan({ ...newPlan, short_description: e.target.value })}
                    placeholder="Brief description of the plan"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPlan.allow_tag}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, allow_tag: checked })}
                    />
                    <Label>Allow Tags</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPlan.allow_note}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, allow_note: checked })}
                    />
                    <Label>Allow Notes</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPlan.allow_chatbot}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, allow_chatbot: checked })}
                    />
                    <Label>Allow Chatbot</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newPlan.allow_api}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, allow_api: checked })}
                    />
                    <Label>Allow API</Label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={handleAddPlan} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Plan'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
