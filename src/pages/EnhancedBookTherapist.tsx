
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

const EnhancedBookTherapist = () => {
  const { user } = useAuthRBAC();
  const navigate = useNavigate();
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  const handleTherapistSelection = (therapistId: string) => {
    setSelectedTherapist(therapistId);
    // Navigate to booking flow or show booking UI
    navigate(`/book-therapist/${therapistId}`);
  };
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Book Therapist | Therapy Platform</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>Find a Therapist</CardTitle>
          <CardDescription>
            Browse our therapists and book a session that fits your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Therapist List (Replace with actual data) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Dr. Jane Doe</CardTitle>
                <CardDescription>Specializes in Anxiety & Depression</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Experienced therapist with a focus on cognitive behavioral therapy.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleTherapistSelection('jane-doe-id')}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Dr. John Smith</CardTitle>
                <CardDescription>Relationship & Family Counseling</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Compassionate counselor providing support for couples and families.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleTherapistSelection('john-smith-id')}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>Dr. Alice Johnson</CardTitle>
                <CardDescription>Trauma & PTSD Specialist</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Dedicated to helping individuals heal from traumatic experiences.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleTherapistSelection('alice-johnson-id')}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBookTherapist;
