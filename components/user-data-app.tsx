"use client"

import { useState, useEffect } from "react"
import UserForm from "./user-form"
import UserList from "./user-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"

export default function UserDataApp() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Function to fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const result = await response.json()

      if (result.success) {
        setUsers(result.data)
      } else {
        setError(result.error || "Failed to fetch users")
      }
    } catch (err) {
      setError("Error connecting to the server")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle user form submission
  const handleAddUser = async (userData) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the user list
        fetchUsers()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error("Error adding user:", err)
      return { success: false, error: "Failed to connect to server" }
    }
  }

  // Function to handle Excel export
  const handleExport = async () => {
    try {
      window.open("/api/export", "_blank")
    } catch (err) {
      console.error("Error exporting data:", err)
      setError("Failed to export data")
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">User Data Management</CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="form">Add User</TabsTrigger>
          <TabsTrigger value="list">View Users</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <UserForm onSubmit={handleAddUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User List</CardTitle>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={users.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </CardHeader>
            <CardContent>
              <UserList users={users} loading={loading} error={error} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
