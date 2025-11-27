import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Star } from 'lucide-react';

interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  isDefault: boolean;
  usageCount: number;
}

interface InquiryResponseTemplatesProps {
  onSelectTemplate?: (template: ResponseTemplate) => void;
  selectedTemplate?: string | null;
}

const InquiryResponseTemplates: React.FC<InquiryResponseTemplatesProps> = ({
  onSelectTemplate,
  selectedTemplate
}) => {
  const [templates] = useState<ResponseTemplate[]>([
    {
      id: '1',
      title: 'Initial Response - General',
      content: `Thank you for reaching out to me. I appreciate you taking the first step in seeking support. 

I would be happy to help you work through the concerns you've shared. Based on your inquiry, I believe we could make good progress together.

I have availability for an initial consultation this week. During this session, we can discuss your goals, my approach, and determine if we're a good fit to work together.

Would you like to schedule a brief 15-minute consultation call to get started?

Best regards,
[Your name]`,
      category: 'general',
      isDefault: true,
      usageCount: 15
    },
    {
      id: '2',
      title: 'Urgent Case Response',
      content: `Thank you for your inquiry. I understand this is an urgent matter for you, and I want to respond quickly.

Based on what you've shared, I believe I can help. I have some immediate availability and would like to schedule a consultation with you as soon as possible.

Please let me know your preferred times, and I'll do my best to accommodate your schedule. If this is a crisis situation, please also consider reaching out to:
- Crisis Text Line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988

I look forward to speaking with you soon.

Best regards,
[Your name]`,
      category: 'urgent',
      isDefault: false,
      usageCount: 8
    },
    {
      id: '3',
      title: 'Specialty Match Response',
      content: `Thank you for your inquiry about [specific concern]. This is an area I specialize in, and I'm confident I can provide the support you're looking for.

I work with many clients facing similar challenges, and I've seen great success using [therapeutic approach]. My approach focuses on [brief description of methodology].

I'd love to set up an initial consultation to learn more about your specific situation and explain how I can help. This session is also an opportunity for you to ask any questions about my background or approach.

Would you prefer to start with a phone consultation or meet in person?

Looking forward to working with you,
[Your name]`,
      category: 'specialty',
      isDefault: false,
      usageCount: 12
    },
    {
      id: '4',
      title: 'Waitlist Response',
      content: `Thank you for your interest in working with me. I'm honored that you're considering me as your therapist.

Currently, my practice is at capacity, but I do have a waitlist for new clients. Based on my current schedule, I anticipate having availability in [timeframe].

In the meantime, I'd be happy to provide you with referrals to other qualified therapists who may have immediate availability. I can also keep you updated on any earlier openings that might arise.

Would you like me to add you to my waitlist and/or provide some referral options?

Best regards,
[Your name]`,
      category: 'waitlist',
      isDefault: false,
      usageCount: 5
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: ResponseTemplate) => {
    onSelectTemplate?.(template);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Response Templates
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="specialty">Specialty</SelectItem>
              <SelectItem value="waitlist">Waitlist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.title}</h4>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  {template.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs capitalize">
                    {template.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Used {template.usageCount} times
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates found for this category.</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InquiryResponseTemplates;