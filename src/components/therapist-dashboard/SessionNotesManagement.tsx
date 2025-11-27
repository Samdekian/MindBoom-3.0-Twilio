import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { Edit, Plus, Trash2, Search, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SessionNote {
  id: string;
  patientName: string;
  sessionDate: string;
  sessionType: string;
  notes: string;
  status: 'draft' | 'completed';
  lastModified: string;
}

const SessionNotesManagement: React.FC = () => {
  const { user } = useAuthRBAC();
  const [notes, setNotes] = useState<SessionNote[]>([
    {
      id: '1',
      patientName: 'John Doe',
      sessionDate: '2024-03-15',
      sessionType: 'Individual Therapy',
      notes: 'Patient showed significant improvement in mood and anxiety levels.',
      status: 'draft',
      lastModified: '2024-03-15T10:30:00Z',
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      sessionDate: '2024-03-14',
      sessionType: 'Group Therapy',
      notes: 'Active participation in group discussion. Working on communication skills.',
      status: 'completed',
      lastModified: '2024-03-14T15:45:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);

  const filteredNotes = notes.filter(note =>
    note.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.sessionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = () => {
    setIsCreating(true);
    setEditingNote({
      id: '',
      patientName: '',
      sessionDate: new Date().toISOString().split('T')[0],
      sessionType: 'Individual Therapy',
      notes: '',
      status: 'draft',
      lastModified: new Date().toISOString(),
    });
  };

  const handleSaveNote = (note: SessionNote) => {
    if (note.id) {
      setNotes(prev => prev.map(n => n.id === note.id ? note : n));
    } else {
      const newNote = {
        ...note,
        id: Date.now().toString(),
        lastModified: new Date().toISOString(),
      };
      setNotes(prev => [...prev, newNote]);
    }
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleEditNote = (note: SessionNote) => {
    setEditingNote(note);
    setIsCreating(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingNote(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Notes Management</CardTitle>
        <CardDescription>Create, edit, and manage therapy session notes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filter section */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Create/Edit form */}
        {isCreating && editingNote && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Patient Name</label>
                    <Input
                      value={editingNote.patientName}
                      onChange={(e) => setEditingNote({...editingNote, patientName: e.target.value})}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Session Date</label>
                    <Input
                      type="date"
                      value={editingNote.sessionDate}
                      onChange={(e) => setEditingNote({...editingNote, sessionDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Session Type</label>
                  <Input
                    value={editingNote.sessionType}
                    onChange={(e) => setEditingNote({...editingNote, sessionType: e.target.value})}
                    placeholder="e.g., Individual Therapy, Group Therapy"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={editingNote.notes}
                    onChange={(e) => setEditingNote({...editingNote, notes: e.target.value})}
                    placeholder="Enter session notes..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleSaveNote(editingNote)}>
                    Save Note
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes list */}
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h3 className="font-semibold">{note.patientName}</h3>
                      <Badge variant={note.status === 'completed' ? 'default' : 'secondary'}>
                        {note.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span>{note.sessionType} - {format(new Date(note.sessionDate), 'MMM d, yyyy')}</span>
                    </div>
                    <p className="text-sm mb-2">{note.notes}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Last modified: {format(new Date(note.lastModified), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditNote(note)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteNote(note.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No notes found matching your search.' : 'No session notes yet. Create your first note!'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionNotesManagement;
