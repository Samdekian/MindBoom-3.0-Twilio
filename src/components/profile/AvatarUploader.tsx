import React, { useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AvatarUploader = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  // Get initials from email or name
  const getInitials = () => {
    const name = user?.user_metadata?.name || user?.email || "";
    return name.substring(0, 2).toUpperCase();
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile photo has been successfully updated.",
      });

      // Log profile update activity
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        activity_type: "profile_photo_updated",
        metadata: { timestamp: new Date().toISOString() }
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      // Get the file path from the URL
      const urlPath = avatarUrl?.split('/').pop();
      
      if (urlPath && !urlPath.includes('default')) {
        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([urlPath]);
          
        if (deleteError) {
          throw deleteError;
        }
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);
      
      toast({
        title: "Avatar removed",
        description: "Your profile photo has been removed.",
      });

      // Log profile update activity
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        activity_type: "profile_photo_removed",
        metadata: { timestamp: new Date().toISOString() }
      });

    } catch (error: any) {
      toast({
        title: "Failed to remove avatar",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error removing avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || ""} alt={user?.email || "User avatar"} />
        <AvatarFallback className="text-xl bg-therapy-purple text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          disabled={uploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload Photo
        </Button>

        {avatarUrl && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1"
            disabled={uploading}
            onClick={removeAvatar}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}

        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUploader;
