import React, { useState } from 'react';
import { useRouter } from 'next/router';

const AppSidebar: React.FC = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<string>('response');
  const searchParams = router.query;

  const handleNavigation = (item: NavItem, e: React.MouseEvent) => {
    // Allow direct navigation for external routes
    if (!item.href.startsWith('/dashboard')) {
      return;
    }

    e.preventDefault()
    console.log('🔵 AppSidebar Navigation:', {
      item,
      currentView: activeView,
      newView: item.view
    })
    
    setActiveView(item.view)
    
    // Use the correct path for Generate Analysis
    const basePath = item.view === 'response' 
      ? '/dashboard/generate-analysis'
      : '/dashboard'
      
    // Preserve existing search params and navigate
    const params = new URLSearchParams(searchParams.toString())
    
    console.log('🟡 AppSidebar URL Construction:', {
      basePath,
      params: params.toString(),
      finalUrl: `${basePath}${params.toString() ? `?${params.toString()}` : ''}`
    })

    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  // Add logging for initial render
  console.log('🔵 AppSidebar Render:', {
    activeView,
    searchParams: searchParams.toString()
  })

  const SidebarContent = () => (
    <div>
      {/* Render your sidebar content here */}
    </div>
  );

  return (
    <div>
      {/* Render your sidebar content here */}
    </div>
  );
};

export default AppSidebar; 