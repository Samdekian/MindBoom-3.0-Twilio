import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Camera, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalPhotoUploaderProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (url: string) => void;
}

const ProfessionalPhotoUploader: React.FC<ProfessionalPhotoUploaderProps> = ({
  currentPhotoUrl,
  onPhotoUpdate
}) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload a photo.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-photo-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (currentPhotoUrl) {
        await deleteCurrentPhoto();
      }

      // Upload new photo
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onPhotoUpdate(publicUrl);
      
      toast({
        title: "Photo Updated",
        description: "Your profile photo has been successfully updated.",
      });

    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteCurrentPhoto = async () => {
    if (!currentPhotoUrl || !user?.id) return;

    try {
      // Extract file path from URL
      const urlParts = currentPhotoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from('avatars')
        .remove([filePath]);

    } catch (error) {
      console.error('Error deleting old photo:', error);
      // Don't throw error here as it shouldn't stop the upload process
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentPhotoUrl || !user?.id) return;

    setIsDeleting(true);

    try {
      await deleteCurrentPhoto();

      // Update profile to remove photo URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw error;

      onPhotoUpdate('');
      
      toast({
        title: "Photo Deleted",
        description: "Your profile photo has been removed.",
      });

    } catch (error: any) {
      console.error('Photo deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserInitials = () => {
    return user?.email?.substring(0, 2).toUpperCase() || 'TH';
  };

  return (
    <div className="flex items-center space-x-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={currentPhotoUrl} alt="Profile photo" />
        <AvatarFallback className="text-lg">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
      
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Profile Photo</h3>
          <p className="text-xs text-muted-foreground">
            Upload a professional headshot. JPG, PNG up to 5MB.
          </p>
        </div>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
          
          {currentPhotoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeletePhoto}
              disabled={isUploading || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPhotoUploader;
