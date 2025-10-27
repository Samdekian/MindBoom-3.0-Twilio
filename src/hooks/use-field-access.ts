
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useFieldAccess = () => {
  const { getFieldAccess } = useAuthRBAC();

  const canReadField = (fieldName: string): boolean => {
    const access = getFieldAccess(fieldName);
    return !access.hidden;
  };

  const canWriteField = (fieldName: string): boolean => {
    const access = getFieldAccess(fieldName);
    return !access.readOnly && !access.hidden;
  };

  return {
    canReadField,
    canWriteField,
    getFieldAccess
  };
};
