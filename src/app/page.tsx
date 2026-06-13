import { columns } from "./columns"
import { DataTable } from "./data-table"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Inactive" | "Pending"
  balance: string
}

const stubUsers: User[] = [
  { id: "728ed52f", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", balance: "$1,200.00" },
  { id: "489e1d42", name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active", balance: "$850.50" },
  { id: "a1b2c3d4", name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive", balance: "$0.00" },
  { id: "e5f6g7h8", name: "David Brown", email: "david@example.com", role: "Editor", status: "Active", balance: "$2,340.75" },
  { id: "i9j0k1l2", name: "Eva Martinez", email: "eva@example.com", role: "Admin", status: "Active", balance: "$1,890.25" },
  { id: "m3n4o5p6", name: "Frank Lee", email: "frank@example.com", role: "Viewer", status: "Pending", balance: "$120.00" },
  { id: "q7r8s9t0", name: "Grace Kim", email: "grace@example.com", role: "Editor", status: "Active", balance: "$670.30" },
  { id: "u1v2w3x4", name: "Henry Chen", email: "henry@example.com", role: "Viewer", status: "Inactive", balance: "$0.00" },
  { id: "y5z6a7b8", name: "Iris Nakamura", email: "iris@example.com", role: "Editor", status: "Active", balance: "$1,450.00" },
  { id: "c9d0e1f2", name: "Jack Thompson", email: "jack@example.com", role: "Viewer", status: "Pending", balance: "$320.00" },
  { id: "g3h4i5j6", name: "Karen Patel", email: "karen@example.com", role: "Admin", status: "Active", balance: "$2,100.50" },
  { id: "k7l8m9n0", name: "Leo Garcia", email: "leo@example.com", role: "Editor", status: "Inactive", balance: "$0.00" },
]

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Users</h2>
      <DataTable columns={columns} data={stubUsers} />
    </div>
  )
}
