
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const adminEmail = "samdekian@gmail.com";
    const adminPassword = "7a9SWrAjv9kGfAq";
    
    console.log("Checking if admin user already exists...");
    
    // First try to find if the user already exists - using a different approach
    // since getUserByEmail might not be available
    const { data: existingUsers, error: listError } = await supabase.auth
      .admin
      .listUsers({
        filter: `email.eq.${adminEmail}`
      });
      
    if (listError) {
      console.error("Error checking for existing user:", listError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error checking for existing user: ${listError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    let userId;
    let existingUserData = null;
    
    // Check if user exists in the returned list
    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      existingUserData = existingUsers.users[0];
      userId = existingUserData.id;
      console.log("Admin user already exists with ID:", userId);
    }
    
    // Handle the case where the user already exists
    if (existingUserData) {
      userId = existingUserData.id;
      console.log("Admin user already exists with ID:", userId);
      
      // Update the user if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          password: adminPassword,
          user_metadata: {
            name: "Rafael Viana",
            accountType: "admin"  // Valid account type for metadata
          },
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error("Error updating admin user:", updateError);
        return new Response(
          JSON.stringify({ success: false, message: `Error updating admin user: ${updateError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      try {
        // Check if the profile exists, create or update it
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, approval_status')
          .eq('id', userId)
          .single();
          
        if (profileError && !profileError.message.includes('No rows found')) {
          console.error("Error checking profile:", profileError);
          return new Response(
            JSON.stringify({ success: false, message: `Error checking profile: ${profileError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // If profile doesn't exist, create it
        if (!profileData) {
          // Create the profile first
          const { error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: "Rafael Viana",
              account_type: "admin",  // Valid account type for profiles table
              approval_status: "approved"  // Ensure approval status is set to approved
            });
            
          if (insertProfileError) {
            console.error("Error creating profile:", insertProfileError);
            return new Response(
              JSON.stringify({ success: false, message: `Error creating profile: ${insertProfileError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // Now insert the audit log AFTER the profile exists
          // Explicitly set the user_id to the admin's ID
          try {
            const { error: auditError } = await supabase
              .from('audit_logs')
              .insert({
                user_id: userId, // Explicitly set the user_id to avoid null values
                activity_type: 'approval_status_change',
                resource_type: 'profiles',
                resource_id: userId,
                metadata: {
                  previous_status: null,
                  new_status: "approved",
                  admin_notes: null,
                  method: 'direct_insert'
                }
              });
              
            if (auditError) {
              // Log but continue - don't fail the whole operation if just the audit fails
              console.error("Error logging audit event:", auditError);
            }
          } catch (auditErr) {
            // Just log the error but continue
            console.error("Exception in audit logging:", auditErr);
          }
        } else {
          // Update existing profile first
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({
              full_name: "Rafael Viana",
              account_type: "admin",  // Valid account type for profiles table
              approval_status: "approved"  // Ensure approval status is set to approved
            })
            .eq('id', userId);
            
          if (updateProfileError) {
            console.error("Error updating profile:", updateProfileError);
            return new Response(
              JSON.stringify({ success: false, message: `Error updating profile: ${updateProfileError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // If the profile was updated to approved, log it
          if (profileData.approval_status !== 'approved') {
            try {
              const { error: auditError } = await supabase
                .from('audit_logs')
                .insert({
                  user_id: userId, // Explicitly setting the user_id field
                  activity_type: 'approval_status_change',
                  resource_type: 'profiles',
                  resource_id: userId,
                  metadata: {
                    previous_status: profileData.approval_status,
                    new_status: "approved",
                    admin_notes: null,
                    method: 'direct_update'
                  }
                });
                
              if (auditError) {
                // Log but continue - don't fail if just the audit log fails
                console.error("Error logging audit event:", auditError);
              }
            } catch (auditErr) {
              // Just log the error but continue
              console.error("Exception in audit logging:", auditErr);
            }
          }
        }
      } catch (error) {
        console.error("Error handling profile operations:", error);
        return new Response(
          JSON.stringify({ success: false, message: `Error handling profile operations: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      // Create new admin user if not found
      try {
        console.log("Creating new admin user...");
        const { data, error } = await supabase.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            name: "Rafael Viana",
            accountType: "admin"  // Valid account type for metadata
          }
        });
        
        if (error) {
          console.error("Error creating admin user:", error);
          return new Response(
            JSON.stringify({ success: false, message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        if (!data?.user) {
          return new Response(
            JSON.stringify({ success: false, message: "User creation failed - no user data returned" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        userId = data.user.id;
        console.log("New admin user created with ID:", userId);
        
        // Create profile for new user with approved status FIRST
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: "Rafael Viana",
            account_type: "admin",  // Valid account type for profiles table
            approval_status: "approved"  // Explicitly set approval status to approved
          });
          
        if (profileError) {
          console.error("Error creating profile for new user:", profileError);
          return new Response(
            JSON.stringify({ success: false, message: `Error creating profile: ${profileError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Insert audit log AFTER profile creation, with explicit user_id
        try {
          const { error: auditError } = await supabase
            .from('audit_logs')
            .insert({
              user_id: userId, // Set explicitly to avoid null
              activity_type: 'approval_status_change',
              resource_type: 'profiles',
              resource_id: userId,
              metadata: {
                previous_status: null,
                new_status: "approved",
                admin_notes: null,
                method: 'new_user_creation'
              }
            });
            
          if (auditError) {
            console.error("Error logging audit event:", auditError);
            // Continue execution - don't fail if just the audit log fails
          }
        } catch (auditErr) {
          // Just log the error but continue
          console.error("Exception in audit logging:", auditErr);
        }
      } catch (error) {
        console.error("Unexpected error creating admin user:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : "An unknown error occurred creating user" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // Assign admin role
    if (userId) {
      try {
        console.log("Getting admin role ID...");
        // Get the admin role ID
        const { data: roles, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'admin')
          .single();
          
        if (roleError) {
          console.error("Error getting admin role:", roleError);
          
          // If the role doesn't exist, create it
          if (roleError.message.includes('No rows found')) {
            console.log("Admin role not found, creating it...");
            const { data: newRole, error: createRoleError } = await supabase
              .from('roles')
              .insert({
                name: 'admin',
                description: 'Administrator with full system access'
              })
              .select()
              .single();
              
            if (createRoleError) {
              return new Response(
                JSON.stringify({ success: false, message: `Error creating admin role: ${createRoleError.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            if (!newRole?.id) {
              return new Response(
                JSON.stringify({ success: false, message: "Failed to create admin role" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            console.log("Admin role created with ID:", newRole.id);
            
            // Assign the newly created role
            const { error: insertRoleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: userId,
                role_id: newRole.id
              });
              
            if (insertRoleError) {
              console.error("Error assigning admin role:", insertRoleError);
              return new Response(
                JSON.stringify({ success: false, message: `Error assigning admin role: ${insertRoleError.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            console.log("Admin role assigned successfully");
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: existingUserData ? 
                  `Admin user updated with ID: ${userId}` : 
                  `Admin user created with ID: ${userId}` 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          return new Response(
            JSON.stringify({ success: false, message: `Error getting admin role: ${roleError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        if (!roles?.id) {
          return new Response(
            JSON.stringify({ success: false, message: "Admin role not found in the database" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        console.log("Admin role found with ID:", roles.id);
        
        // Check if user already has the admin role
        const { data: existingRoles, error: checkRoleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role_id', roles.id);
        
        if (checkRoleError) {
          console.error("Error checking existing roles:", checkRoleError);
          return new Response(
            JSON.stringify({ success: false, message: `Error checking existing roles: ${checkRoleError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Only assign role if it doesn't exist
        if (!existingRoles || existingRoles.length === 0) {
          console.log("Assigning admin role to user...");
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role_id: roles.id
            });
          
          if (insertError) {
            console.error("Error assigning admin role:", insertError);
            return new Response(
              JSON.stringify({ success: false, message: `Error assigning admin role: ${insertError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          console.log("Admin role assigned successfully");
        } else {
          console.log("User already has admin role");
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: existingUserData ? 
              `Admin user updated with ID: ${userId}` : 
              `Admin user created with ID: ${userId}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error("Unexpected error assigning admin role:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : "An unknown error occurred assigning role" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, message: "Failed to create or update admin user" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
    
  } catch (error) {
    console.error("Unexpected error in create-admin-user function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "An unknown error occurred" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
