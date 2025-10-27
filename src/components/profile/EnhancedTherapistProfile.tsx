import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { User, Mail, Phone, MapPin, Calendar, Star, Award, BookOpen, Shield } from "lucide-react";

const EnhancedTherapistProfile = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    credentials: "",
    specialties: "",
    awards: "",
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
        credentials: data.credentials || "",
        specialties: data.specialties || "",
        awards: data.awards || "",
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message || "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        credentials: formData.credentials,
        specialties: formData.specialties,
        awards: formData.awards,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapist Profile</CardTitle>
        <CardDescription>Manage your professional profile details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              disabled={!editing}
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input id="email" value={formData.email} disabled />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={!editing}
            />
          </div>

          <div>
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={!editing}
              rows={2}
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="bio" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Biography
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={!editing}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="credentials" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Credentials
            </Label>
            <Textarea
              id="credentials"
              value={formData.credentials}
              onChange={(e) => handleInputChange("credentials", e.target.value)}
              disabled={!editing}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="specialties" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Specialties
            </Label>
            <Textarea
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange("specialties", e.target.value)}
              disabled={!editing}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="awards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Awards
            </Label>
            <Textarea
              id="awards"
              value={formData.awards}
              onChange={(e) => handleInputChange("awards", e.target.value)}
              disabled={!editing}
              rows={2}
            />
          </div>
        </div>
      </CardContent>
      <div className="flex justify-end p-4 border-t">
        {editing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                if (profile) {
                  setFormData({
                    full_name: profile.full_name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                    bio: profile.bio || "",
                    credentials: profile.credentials || "",
                    specialties: profile.specialties || "",
                    awards: profile.awards || "",
                  });
                }
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="ml-2"
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>
    </Card>
  );
};

export default EnhancedTherapistProfile;
