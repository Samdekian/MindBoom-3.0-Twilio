
import React from "react";
import { Helmet } from "react-helmet-async";
import MessageCenter from "@/components/messaging/MessageCenter";

const MessagingPage = () => {
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Messages | Therapy Platform</title>
      </Helmet>
      <MessageCenter />
    </div>
  );
};

export default MessagingPage;
