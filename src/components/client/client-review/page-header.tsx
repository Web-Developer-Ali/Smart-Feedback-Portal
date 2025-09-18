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
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">FP</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FreelancePortal</h1>
              <p className="text-gray-600 text-sm">Project Review Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <img
              src={freelancerAvatar || "/placeholder.svg"}
              alt={freelancerName}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
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
