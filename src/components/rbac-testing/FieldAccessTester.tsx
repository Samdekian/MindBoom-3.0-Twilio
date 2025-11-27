import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useFieldAccess } from '@/hooks/use-field-access';

const FieldAccessTester: React.FC = () => {
  const { user } = useAuthRBAC();
  const { canReadField, canWriteField } = useFieldAccess();

  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleRead = () => {
    if (!fieldName) {
      setMessage('Please enter a field name to read.');
      return;
    }
    if (canReadField(fieldName)) {
      setMessage(`You have read access to the field "${fieldName}".`);
    } else {
      setMessage(`You do NOT have read access to the field "${fieldName}".`);
    }
  };

  const handleWrite = () => {
    if (!fieldName) {
      setMessage('Please enter a field name to write.');
      return;
    }
    if (canWriteField(fieldName)) {
      setMessage(`You have write access to the field "${fieldName}".`);
    } else {
      setMessage(`You do NOT have write access to the field "${fieldName}".`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Access Tester</CardTitle>
        <CardDescription>
          Test your read and write permissions for specific fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="Enter field name"
          />
        </div>
        <div className="flex space-x-2 mb-4">
          <Button onClick={handleRead} variant="outline" className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>Check Read Access</span>
          </Button>
          <Button onClick={handleWrite} variant="outline" className="flex items-center space-x-1">
            <EyeOff className="h-4 w-4" />
            <span>Check Write Access</span>
          </Button>
        </div>
        {message && (
          <Alert variant={message.includes('NOT') ? 'destructive' : 'default'}>
            <Shield className="h-4 w-4 mr-2" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldAccessTester;
