import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { PROTECTED_PATHS } from '@/routes/routePaths';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { userRoles, isAuthenticated, loading } = useAuthRBAC();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !userRoles.includes('admin'))) {
      navigate(PROTECTED_PATHS.DASHBOARD);
    }
  }, [isAuthenticated, userRoles, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !userRoles.includes('admin')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0 border-r border-gray-200">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
          <ul className="space-y-2">
            <li>
              <a href="/admin" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path></svg>
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/admin/users" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H13zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H13z"></path></svg>
                <span className="ml-3">Users</span>
              </a>
            </li>
            <li>
              <a href="/admin/rbac" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                <span className="ml-3">RBAC Management</span>
              </a>
            </li>
            <li>
              <a href="/admin/role-management" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm0 5a1 1 0 100 2 1 1 0 000-2zM8 6a1 1 0 11-2 0 1 1 0 012 0zm6 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path></svg>
                <span className="ml-3">Role Management</span>
              </a>
            </li>
            <li>
              <a href="/admin/security" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                <span className="ml-3">Security Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/admin/therapist-approval" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 00-1 1v3a1 1 0 001 1h6a1 1 0 100-2H7V9a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                <span className="ml-3">Therapist Approval</span>
              </a>
            </li>
            <li>
              <a href="/admin/reports" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586L8.707 7.293zM12.929 10.293a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414l.293-.293V17a1 1 0 102 0v-4.586l.293.293a1 1 0 001.414-1.414l-2-2z"></path></svg>
                <span className="ml-3">Reports</span>
              </a>
            </li>
            <li>
              <a href="/admin/system" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-100">
                <svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5l-4 6a1 1 0 101.734 1L9 8.268l4.865 7.3A1 1 0 1015.132 15l-4-6A1 1 0 0010 7z" clipRule="evenodd"></path></svg>
                <span className="ml-3">System</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
