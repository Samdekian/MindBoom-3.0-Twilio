import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface PatientNotesTabProps {
  patientId: string;
}

const PatientNotesTab: React.FC<PatientNotesTabProps> = ({ patientId }) => {
  const [notes, setNotes] = useState([
    { id: '1', date: '2024-03-15', content: 'Discussed progress on goals.' },
    { id: '2', date: '2024-03-08', content: 'Reviewed coping mechanisms.' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = () => {
    setIsAddingNote(true);
  };

  const handleSaveNote = () => {
    const newNote = {
      id: String(notes.length + 1),
      date: new Date().toISOString().slice(0, 10),
      content: newNoteContent,
    };
    setNotes([...notes, newNote]);
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
  };

  const handleEditNote = (noteId: string) => {
    // Implement edit functionality here
    console.log('Editing note:', noteId);
  };

  const handleDeleteNote = (noteId: string) => {
    // Implement delete functionality here
    console.log('Deleting note:', noteId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Notes</CardTitle>
        <CardDescription>Manage and view notes for this patient.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredNotes.map(note => (
          <Card key={note.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <Calendar className="mr-2 h-4 w-4" />
                {note.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="resize-none border-none shadow-none focus-visible:ring-0"
                value={note.content}
                readOnly
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditNote(note.id)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {isAddingNote ? (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter new note content..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={handleCancelAdd}>
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </div>
          </div>
        ) : (
          <Button onClick={handleAddNote} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Note
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientNotesTab;
