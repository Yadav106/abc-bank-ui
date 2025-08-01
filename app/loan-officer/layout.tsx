import Sidebar from '../components/sidebar/Sidebar'

export default function LoanOfficerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Sidebar>
      {children}
    </Sidebar>
  )
} 