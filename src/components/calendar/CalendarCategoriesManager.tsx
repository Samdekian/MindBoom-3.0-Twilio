
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Tags, Palette } from "lucide-react";

// Mock data for categories
const mockCategories = [
  { id: 1, name: 'Therapy Session', color: '#10b981', icon: '🧠' },
  { id: 2, name: 'Group Session', color: '#3b82f6', icon: '👥' },
  { id: 3, name: 'Assessment', color: '#f59e0b', icon: '📋' },
  { id: 4, name: 'Follow-up', color: '#8b5cf6', icon: '🔄' }
];

const ColorCircle = ({ color }: { color: string }) => (
  <div 
    className="h-6 w-6 rounded-full" 
    style={{ backgroundColor: color }}
  />
);

const CalendarCategoriesManager = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#10b981',
    icon: '📆'
  });

  const handleRemoveCategory = (id: number) => {
    setCategories(categories.filter(category => category.id !== id));
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      setCategories([
        ...categories, 
        { 
          id: Date.now(), 
          name: newCategory.name, 
          color: newCategory.color, 
          icon: newCategory.icon 
        }
      ]);
      setNewCategory({ name: '', color: '#10b981', icon: '📆' });
      setIsAddDialogOpen(false);
    }
  };

  const colorOptions = [
    { name: 'Green', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const iconOptions = ['📆', '🧠', '👥', '📋', '🔄', '💬', '🎯', '⏰', '💼', '🏥'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Appointment Categories
        </CardTitle>
        <CardDescription>
          Define categories and color coding for your appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Categories</h3>
              <p className="text-sm text-muted-foreground">
                Organize your appointments with custom categories
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <ColorCircle color={category.color} />
                    </TableCell>
                    <TableCell>
                      <span className="text-xl">{category.icon}</span>
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new appointment category with custom color and icon
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                value={newCategory.name} 
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="e.g., Therapy Session"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="grid grid-cols-7 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, color: color.value})}
                    className={`h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      newCategory.color === color.value ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, icon})}
                    className={`h-8 w-8 flex items-center justify-center text-xl bg-muted rounded focus:outline-none focus:ring-2 ${
                      newCategory.icon === icon ? 'ring-2 ring-black dark:ring-white bg-muted-foreground/10' : ''
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CalendarCategoriesManager;
