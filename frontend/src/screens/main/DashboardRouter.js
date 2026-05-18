import React from 'react';
import useAuthStore from '../../stores/authStore';
import ProfessionalDashboardScreen from './ProfessionalDashboardScreen';
import NgoDashboardScreen from '../ngo/NgoDashboardScreen';
import AdminDashboardScreen from '../admin/AdminDashboardScreen';

const DashboardRouter = (props) => {
  const user = useAuthStore((s) => s.user);

  switch (user?.role) {
    case 'ngo':
      return <NgoDashboardScreen {...props} />;
    case 'verifier':
    case 'admin':
      return <AdminDashboardScreen {...props} />;
    default:
      return <ProfessionalDashboardScreen {...props} />;
  }
};

export default DashboardRouter;
