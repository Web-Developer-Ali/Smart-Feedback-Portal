import Image from "next/image"
import logo from "@/../../public/favicon.ico"
interface PageHeaderProps {
  freelancerName: string
  freelancerAvatar: string
}

export function PageHeader({ freelancerName, freelancerAvatar }: PageHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="from-purple-600 to-blue-600 rounded-lg p-2">
            <Image 
              src={logo} 
              alt="WorkSpan Logo" 
              width={40}
              height={40}
              className="text-white"
            />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WorkSpan</h1>
              <p className="text-gray-600 text-sm">Project Review Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Image
              src={freelancerAvatar || "/placeholder.svg"}
              alt={freelancerName}
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-200 object-cover"
            />
            <div className="text-right">
              <p className="text-gray-900 font-medium">{freelancerName}</p>
              <p className="text-gray-600 text-sm">Freelancer</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
