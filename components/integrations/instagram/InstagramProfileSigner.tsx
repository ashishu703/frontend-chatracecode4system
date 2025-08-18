"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import serverHandler from "@/utils/serverHandler"

type InstagramAccount = {
  social_account_id: string
  name: string
}

type InstagramConfig = {
  authURI?: string
}

interface Props {
  config?: InstagramConfig
}

export default function InstagramProfileSigner({ config }: Props) {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([])
  const [localConfig, setLocalConfig] = useState<InstagramConfig | undefined>(config)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      type AccountsResponse = { profiles?: InstagramAccount[] } | { data?: { profiles?: InstagramAccount[] } }
      const res = await serverHandler.get<AccountsResponse>("/api/instagram/accounts")
      const profiles = (res.data as any)?.profiles || (res.data as any)?.data?.profiles || []
      setAccounts(profiles)
    } catch (err) {
      // no-op
    }
  }

  const authInit = async () => {
    try {
      const authURI = localConfig?.authURI
      if (!authURI) throw new Error("Auth URI is missing")
      // Attach JWT in state so the server callback can authenticate
      const token =
        (typeof window !== 'undefined' && window.localStorage.getItem('serviceToken')) ||
        (typeof window !== 'undefined' && window.localStorage.getItem('adminToken')) ||
        (typeof window !== 'undefined' && window.localStorage.getItem('agentToken')) ||
        null

      const url = new URL(authURI)
      const prevState = url.searchParams.get('state') || 'instagram'
      // Extract the redirect_uri used in the dialog so the callback can reuse exactly the same value
      const dialogRedirect = url.searchParams.get('redirect_uri') || ''
      const encodedDialogRedirect = dialogRedirect ? encodeURIComponent(dialogRedirect) : ''
      const nextState = token ? `instagram|${token}|${Date.now()}|${encodedDialogRedirect}` : prevState
      url.searchParams.set('state', nextState)
      window.location.href = url.toString()
    } catch (error) {
      // no-op
    }
  }

  const disconnect = async (account: InstagramAccount) => {
    const confirmed = typeof window !== "undefined" ? window.confirm("Are you sure you want to disconnect this account?") : false
    if (!confirmed) return
    try {
      setLoading(true)
      await serverHandler.delete(`/api/instagram/accounts/${account.social_account_id}`)
      await fetchAccounts()
    } catch (err) {
      // no-op
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-left">
        <h3 className="font-semibold">Instagram</h3>
        <div className="mt-1 h-px w-full bg-gray-200" />
      </div>

      {accounts.length > 0 ? (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.social_account_id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm font-medium">{account.name}</span>
              <Button variant="destructive" size="sm" disabled={loading} onClick={() => disconnect(account)}>
                Disconnect
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Button size="sm" onClick={authInit}>Add account</Button>
      )}
    </div>
  )
}


